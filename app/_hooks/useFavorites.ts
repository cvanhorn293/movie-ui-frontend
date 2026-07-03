"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { addFavorite, fetchFavorites, removeFavorite } from "@/app/_lib/api";
import type { DashboardData, Favorite, FavoriteEntityType, MovieSummary, PersonSummary } from "@/app/_lib/types";
import { useAuth } from "./useAuth";

interface ToggleVariables {
    entityType: FavoriteEntityType;
    entityId: number;
    title: string;
    imageUrl: string | null;
    isFavorited: boolean;
}

interface MutationContext {
    previousFavorites?: Favorite[];
    previousDashboard?: DashboardData;
}

function makeOptimisticFavorite(entityType: FavoriteEntityType, entityId: number, title: string, imageUrl: string | null): Favorite {
    return {
        id: -Date.now(),
        entityType,
        entityId,
        title,
        imageUrl,
        createdAt: new Date().toISOString(),
    };
}

function matches(favorite: Favorite, entityType: FavoriteEntityType, entityId: number): boolean {
    return favorite.entityType === entityType && favorite.entityId === entityId;
}

export function useFavorites() {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    const { data } = useQuery({
        queryKey: ["favorites"],
        queryFn: fetchFavorites,
        enabled: isAuthenticated,
        staleTime: 60 * 1000,
    });

    const favorites = Array.isArray(data) ? data : [];

    const { favoriteMovieIds, favoritePersonIds } = useMemo(() => {
        const movieIds = new Set<number>();
        const personIds = new Set<number>();
        for (const favorite of favorites) {
            if (favorite.entityType === "MOVIE") {
                movieIds.add(favorite.entityId);
            } else if (favorite.entityType === "PERSON") {
                personIds.add(favorite.entityId);
            }
        }
        return { favoriteMovieIds: movieIds, favoritePersonIds: personIds };
    }, [favorites]);

    const favoritePeople = useMemo(() => favorites.filter((favorite) => favorite.entityType === "PERSON"), [favorites]);

    const mutation = useMutation<Favorite | null, unknown, ToggleVariables, MutationContext>({
        mutationFn: async ({ entityType, entityId, isFavorited }) => {
            const request = { entityType, entityId };
            if (isFavorited) {
                await removeFavorite(request);
                return null;
            }
            return addFavorite(request);
        },
        onMutate: async ({ entityType, entityId, title, imageUrl, isFavorited }) => {
            await queryClient.cancelQueries({ queryKey: ["favorites"] });
            await queryClient.cancelQueries({ queryKey: ["dashboard"] });

            const previousFavorites = queryClient.getQueryData<Favorite[]>(["favorites"]);
            const previousDashboard = queryClient.getQueryData<DashboardData>(["dashboard"]);
            const optimistic = makeOptimisticFavorite(entityType, entityId, title, imageUrl);

            queryClient.setQueryData<Favorite[]>(["favorites"], (current = []) =>
                isFavorited ? current.filter((favorite) => !matches(favorite, entityType, entityId)) : [optimistic, ...current],
            );

            queryClient.setQueryData<DashboardData>(["dashboard"], (current) => {
                if (!current) {
                    return current;
                }
                const delta = isFavorited ? -1 : 1;
                const next: DashboardData = {
                    ...current,
                    favoriteCount: Math.max(0, current.favoriteCount + delta),
                    recentFavorites: isFavorited
                        ? current.recentFavorites.filter((favorite) => !matches(favorite, entityType, entityId))
                        : [optimistic, ...current.recentFavorites].slice(0, 10),
                };
                if (entityType === "MOVIE") {
                    next.movieCount = Math.max(0, current.movieCount + delta);
                } else {
                    next.personCount = Math.max(0, current.personCount + delta);
                }
                return next;
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
            mutation.mutate({
                entityType: "MOVIE",
                entityId: movie.tmdbId,
                title: movie.title,
                imageUrl: movie.posterUrl,
                isFavorited: favoriteMovieIds.has(movie.tmdbId),
            });
        },
        [isAuthenticated, favoriteMovieIds, mutation],
    );

    const togglePersonFavorite = useCallback(
        (person: PersonSummary) => {
            if (!isAuthenticated) {
                return;
            }
            mutation.mutate({
                entityType: "PERSON",
                entityId: person.tmdbId,
                title: person.name,
                imageUrl: person.profileUrl,
                isFavorited: favoritePersonIds.has(person.tmdbId),
            });
        },
        [isAuthenticated, favoritePersonIds, mutation],
    );

    const isFavorited = useCallback((tmdbId: number) => favoriteMovieIds.has(tmdbId), [favoriteMovieIds]);
    const isPersonFavorited = useCallback((tmdbId: number) => favoritePersonIds.has(tmdbId), [favoritePersonIds]);

    return {
        favorites,
        favoritePeople,
        favoriteMovieIds,
        favoritePersonIds,
        isFavorited,
        isPersonFavorited,
        toggleFavorite,
        togglePersonFavorite,
        isAuthenticated,
        isToggling: mutation.isPending,
    };
}
