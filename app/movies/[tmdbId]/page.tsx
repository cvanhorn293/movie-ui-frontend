"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard, fetchMovie } from "@/app/_lib/api";
import { getAllMovies } from "@/app/_lib/dashboard-utils";
import { getSimilarMovies } from "@/app/_lib/movie-utils";
import MovieDetailView, { MovieDetailSkeleton } from "@/app/_components/movies/MovieDetailView";

export default function MovieDetailPage() {
    const params = useParams<{ tmdbId: string }>();
    const tmdbId = Number(params.tmdbId);
    const validId = !Number.isNaN(tmdbId);

    const movieQuery = useQuery({
        queryKey: ["movie", tmdbId],
        queryFn: () => fetchMovie(tmdbId),
        enabled: validId,
        retry: false,
    });

    const dashboardQuery = useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboard,
        staleTime: 5 * 60 * 1000,
    });

    const similarMovies = useMemo(() => {
        if (!movieQuery.data || !dashboardQuery.data) {
            return [];
        }
        return getSimilarMovies(getAllMovies(dashboardQuery.data), movieQuery.data);
    }, [movieQuery.data, dashboardQuery.data]);

    if (!validId) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 pt-24">
                <p className="text-secondary">Invalid movie ID.</p>
                <Link href="/movies" className="text-sm font-medium text-[#38FDCF] hover:opacity-80">
                    Back to movies
                </Link>
            </div>
        );
    }

    if (movieQuery.isLoading) {
        return <MovieDetailSkeleton />;
    }

    if (movieQuery.error || !movieQuery.data) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 pt-24">
                <p className="text-secondary">Could not load this movie.</p>
                <Link href="/movies" className="text-sm font-medium text-[#38FDCF] hover:opacity-80">
                    Back to movies
                </Link>
            </div>
        );
    }

    return <MovieDetailView movie={movieQuery.data} similarMovies={similarMovies} />;
}
