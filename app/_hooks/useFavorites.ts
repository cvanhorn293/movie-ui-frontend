"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { addFavorite, fetchFavorites, removeFavorite } from "@/app/_lib/api";
import type { DashboardData, Favorite, MovieSummary } from "@/app/_lib/types";
import { useAuth } from "./useAuth";

interface ToggleVariables {
    movie: MovieSummary;
    isFavorited: boolean;
}

interface MutationContext {
    previousFavorites?: Favorite[];
    previousDashboard?: DashboardData;
}

function makeOptimisticFavorite(movie: MovieSummary): Favorite {
    return {
        id: -Date.now(),
        entityType: "MOVIE",
        entityId: movie.tmdbId,
        title: movie.title,
        imageUrl: movie.posterUrl,
        createdAt: new Date().toISOString(),
    };
}

function isMovieFavorite(favorite: Favorite, tmdbId: number): boolean {
    return favorite.entityType === "MOVIE" && favorite.entityId === tmdbId;
}

export function useFavorites() {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    const { data: favorites = [] } = useQuery({
        queryKey: ["favorites"],
        queryFn: fetchFavorites,
        enabled: isAuthenticated,
        staleTime: 60 * 1000,
    });

    const favoriteMovieIds = useMemo(() => {
        const ids = new Set<number>();
        for (const favorite of favorites) {
            if (favorite.entityType === "MOVIE") {
                ids.add(favorite.entityId);
            }
        }
        return ids;
    }, [favorites]);

    const mutation = useMutation<Favorite | null, unknown, ToggleVariables, MutationContext>({
        mutationFn: async ({ movie, isFavorited }) => {
            const request = { entityType: "MOVIE" as const, entityId: movie.tmdbId };
            if (isFavorited) {
                await removeFavorite(request);
                return null;
            }
            return addFavorite(request);
        },
        onMutate: async ({ movie, isFavorited }) => {
            await queryClient.cancelQueries({ queryKey: ["favorites"] });
            await queryClient.cancelQueries({ queryKey: ["dashboard"] });

            const previousFavorites = queryClient.getQueryData<Favorite[]>(["favorites"]);
            const previousDashboard = queryClient.getQueryData<DashboardData>(["dashboard"]);
            const optimistic = makeOptimisticFavorite(movie);

            queryClient.setQueryData<Favorite[]>(["favorites"], (current = []) =>
                isFavorited ? current.filter((favorite) => !isMovieFavorite(favorite, movie.tmdbId)) : [optimistic, ...current],
            );

            queryClient.setQueryData<DashboardData>(["dashboard"], (current) => {
                if (!current) {
                    return current;
                }
                if (isFavorited) {
                    return {
                        ...current,
                        favoriteCount: Math.max(0, current.favoriteCount - 1),
                        recentFavorites: current.recentFavorites.filter((favorite) => !isMovieFavorite(favorite, movie.tmdbId)),
                    };
                }
                return {
                    ...current,
                    favoriteCount: current.favoriteCount + 1,
                    recentFavorites: [optimistic, ...current.recentFavorites].slice(0, 10),
                };
            });

            return { previousFavorites, previousDashboard };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousFavorites) {
                queryClient.setQueryData(["favorites"], context.previousFavorites);
            }
            if (context?.previousDashboard) {
                queryClient.setQueryData(["dashboard"], context.previousDashboard);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const toggleFavorite = useCallback(
        (movie: MovieSummary) => {
            if (!isAuthenticated) {
                return;
            }
            mutation.mutate({ movie, isFavorited: favoriteMovieIds.has(movie.tmdbId) });
        },
        [isAuthenticated, favoriteMovieIds, mutation],
    );

    const isFavorited = useCallback((tmdbId: number) => favoriteMovieIds.has(tmdbId), [favoriteMovieIds]);

    return {
        favorites,
        favoriteMovieIds,
        isFavorited,
        toggleFavorite,
        isAuthenticated,
        isToggling: mutation.isPending,
    };
}
