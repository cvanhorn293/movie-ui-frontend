"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "./_lib/api";
import { useAuth } from "./_hooks/useAuth";
import { buildCollectionInsights, buildGenreStats, getAllMovies } from "./_lib/dashboard-utils";
import CollectionInsights from "./_components/home/CollectionInsights";
import MovieCarousel from "./_components/home/MovieCarousel";
import MovieDnaSection from "./_components/home/MovieDnaSection";
import MovieSpotlight from "./_components/home/MovieSpotlight";

export default function Home() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboard,
    });

    const genreStats = useMemo(() => buildGenreStats(data ? getAllMovies(data) : []), [data]);
    const insights = useMemo(() => (data ? buildCollectionInsights(data, genreStats) : null), [data, genreStats]);

    const spotlightMovie = data?.featuredMovies[0] ?? null;
    const pageLoading = isLoading || authLoading;

    return (
        <div className="flex w-full flex-col">
            <MovieSpotlight movie={spotlightMovie} isLoading={pageLoading} />

            <div className="container mx-auto flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
                {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">Could not load dashboard data. Make sure the backend is running at {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}.</div>}

                {isAuthenticated && <MovieDnaSection data={data} isLoading={pageLoading} />}

                <MovieCarousel title="Trending Movies" movies={data?.trendingMovies ?? []} isLoading={pageLoading} />

                {isAuthenticated && insights && <CollectionInsights insights={insights} isLoading={pageLoading} />}

                {isAuthenticated && <MovieCarousel title="Recommended Movies" movies={data?.recommendedMovies ?? []} isLoading={pageLoading} />}
            </div>
        </div>
    );
}
