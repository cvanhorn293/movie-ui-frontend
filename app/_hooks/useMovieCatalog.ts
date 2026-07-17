"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { fetchDashboard, fetchMovieBrowse, fetchRecommendations, searchAll } from "@/app/_lib/api";
import { getAllMovies } from "@/app/_lib/dashboard-utils";
import { BROWSE_GENRE_QUERIES, groupMoviesByGenre, mergeUniqueMovies } from "@/app/_lib/movie-utils";
import type { MovieBrowseGenreRow, MovieBrowseResponse, MovieSummary } from "@/app/_lib/types";
import { useAuth } from "./useAuth";

function buildLegacyCatalog(
    dashboardData: NonNullable<Awaited<ReturnType<typeof fetchDashboard>>>,
    recommendationMovies: MovieSummary[],
    genreSearchMovies: MovieSummary[],
): Pick<MovieBrowseResponse, "trendingMovies" | "genreRows"> {
    const trendingMovies = dashboardData.trendingMovies;
    const trendingIds = new Set(trendingMovies.map((movie) => movie.tmdbId));
    const pool = mergeUniqueMovies(getAllMovies(dashboardData), recommendationMovies, genreSearchMovies);
    const genreRows = groupMoviesByGenre(pool, {
        exclusive: true,
        excludeTmdbIds: trendingIds,
        minMoviesPerGenre: 3,
    }).map((row) => ({
        genreId: 0,
        genreName: row.genreName,
        movies: row.movies,
    }));

    return { trendingMovies, genreRows };
}

export function useMovieCatalog() {
    const { isAuthenticated } = useAuth();

    const browse = useQuery({
        queryKey: ["movie-browse"],
        queryFn: fetchMovieBrowse,
        staleTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return false;
            }

            return failureCount < 1;
        },
    });

    // Older backends lack /api/movies/browse - fall back to dashboard + search.
    const useLegacyBrowse = browse.isError && axios.isAxiosError(browse.error) && browse.error.response?.status === 404;

    const dashboard = useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboard,
        staleTime: 5 * 60 * 1000,
        enabled: useLegacyBrowse,
    });

    const recommendations = useQuery({
        queryKey: ["recommendations"],
        queryFn: fetchRecommendations,
        enabled: useLegacyBrowse && isAuthenticated,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const genreSearches = useQueries({
        queries: BROWSE_GENRE_QUERIES.map((genre) => ({
            queryKey: ["genre-browse", genre],
            queryFn: () => searchAll(genre),
            staleTime: 10 * 60 * 1000,
            enabled: useLegacyBrowse && Boolean(dashboard.data),
        })),
    });

    const genreSearchMovies = useMemo(() => genreSearches.flatMap((query) => query.data?.movies ?? []), [genreSearches]);

    const catalog = useMemo(() => {
        if (browse.data) {
            return {
                trendingMovies: browse.data.trendingMovies,
                genreRows: browse.data.genreRows,
            };
        }

        if (!useLegacyBrowse || !dashboard.data) {
            return {
                trendingMovies: [] as MovieSummary[],
                genreRows: [] as MovieBrowseGenreRow[],
            };
        }

        return buildLegacyCatalog(dashboard.data, recommendations.data?.movies ?? [], genreSearchMovies);
    }, [browse.data, useLegacyBrowse, dashboard.data, recommendations.data?.movies, genreSearchMovies]);

    const isLoading = browse.isLoading || (useLegacyBrowse && dashboard.isLoading);
    const isEnriching = useLegacyBrowse && genreSearches.some((query) => query.isLoading);

    return {
        ...catalog,
        error: useLegacyBrowse ? dashboard.error : browse.error,
        isLoading,
        isEnriching,
        usesLegacyBrowse: useLegacyBrowse,
    };
}
