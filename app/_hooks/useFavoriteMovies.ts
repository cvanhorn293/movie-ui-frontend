"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchMovie } from "@/app/_lib/api";
import { favoriteToMovieSummary } from "@/app/_lib/personUtils";
import type { Favorite, MovieSummary } from "@/app/_lib/types";

/** Loads full movie details for favorites; falls back to favorite metadata while loading. */
export function useFavoriteMovies(movieFavorites: Favorite[]) {
    const queries = useQueries({
        queries: movieFavorites.map((favorite) => ({
            queryKey: ["movie", favorite.entityId],
            queryFn: () => fetchMovie(favorite.entityId),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const movies = useMemo(() => {
        return movieFavorites.map((favorite, index): MovieSummary => {
            const detail = queries[index]?.data;
            if (!detail) {
                return favoriteToMovieSummary(favorite);
            }

            return {
                tmdbId: detail.tmdbId,
                title: detail.title,
                overview: detail.overview,
                posterUrl: detail.posterUrl ?? favorite.imageUrl,
                backdropUrl: detail.backdropUrl,
                rating: detail.rating,
                releaseDate: detail.releaseDate,
                genreIds: detail.genreIds ?? [],
                genreNames: detail.genreNames ?? [],
            };
        });
    }, [movieFavorites, queries]);

    const isLoading = movieFavorites.length > 0 && queries.some((query) => query.isLoading && !query.data);

    return { movies, isLoading };
}
