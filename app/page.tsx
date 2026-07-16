"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "./_lib/api";
import { useAuth } from "./_hooks/useAuth";
import { buildCollectionInsights, buildGenreStats, getAllMovies, getDistinctRecommendedMovies } from "./_lib/dashboard-utils";
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
    // Hide recommendations that already appear in trending/featured.
    const recommendedMovies = useMemo(() => (data ? getDistinctRecommendedMovies(data) : []), [data]);

    const spotlightMovie = data?.featuredMovies[0] ?? null;
    const pageLoading = isLoading || authLoading;

    return (
        <div className="flex w-full flex-col">
            {/* Full-bleed featured movie hero */}
            <MovieSpotlight movie={spotlightMovie} isLoading={pageLoading} />

            <div className="container mx-auto flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
                {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">Could not load dashboard data. Make sure the backend is running at {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}.</div>}

                {/* Personalized collection breakdown (signed-in only) */}
                {isAuthenticated && <MovieDnaSection data={data} isLoading={pageLoading} />}

                {/* Prompt guests to sign in for personal features */}
                {!authLoading && !isAuthenticated && (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
                        <div>
                            <h3 className="text-base font-semibold text-primary">Make it yours</h3>
                            <p className="mt-1 text-sm text-secondary">Sign in to unlock your Movie DNA, personalized recommendations, and saved favorites.</p>
                        </div>
                        <Link href="/login" className="btn-gradient inline-flex shrink-0 items-center justify-center rounded-xl px-6 py-2.5 text-sm font-medium">
                            <span className="btn-gradient-text">Sign in</span>
                        </Link>
                    </div>
                )}

                <MovieCarousel title="Trending Movies" movies={data?.trendingMovies ?? []} isLoading={pageLoading} />

                {isAuthenticated && insights && <CollectionInsights insights={insights} isLoading={pageLoading} />}

                {isAuthenticated && <MovieCarousel title="Recommended Movies" movies={recommendedMovies} isLoading={pageLoading} />}
            </div>
        </div>
    );
}
