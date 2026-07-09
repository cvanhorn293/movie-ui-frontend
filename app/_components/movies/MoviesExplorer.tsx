"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard, searchAll } from "@/app/_lib/api";
import { getAllMovies } from "@/app/_lib/dashboard-utils";
import { groupMoviesByGenre } from "@/app/_lib/movie-utils";
import MovieCarousel from "@/app/_components/home/MovieCarousel";
import MovieSpotlight from "@/app/_components/home/MovieSpotlight";
import SearchIcon from "@/app/_icons/Search.svg";

function SectionHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="text-lg font-medium text-primary roboto-flex">{children}</h2>;
}

export default function MoviesExplorer() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 350);
        return () => clearTimeout(timeout);
    }, [query]);

    const isSearching = debouncedQuery.length > 0;

    const dashboard = useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboard,
        staleTime: 5 * 60 * 1000,
    });

    const search = useQuery({
        queryKey: ["movies-search", debouncedQuery],
        queryFn: () => searchAll(debouncedQuery),
        enabled: isSearching,
        staleTime: 60 * 1000,
    });

    const allMovies = useMemo(() => (dashboard.data ? getAllMovies(dashboard.data) : []), [dashboard.data]);
    const genreRows = useMemo(() => groupMoviesByGenre(allMovies), [allMovies]);
    const spotlightMovie = dashboard.data?.featuredMovies[0] ?? dashboard.data?.trendingMovies[0] ?? null;
    const pageLoading = dashboard.isLoading;

    return (
        <div className="flex w-full flex-col">
            {!isSearching && <MovieSpotlight movie={spotlightMovie} isLoading={pageLoading} />}

            <div className="container mx-auto flex flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold text-primary sm:text-3xl">Movies</h1>
                    <p className="max-w-2xl text-sm text-secondary">Browse by genre, search for titles, and dive into full movie details.</p>
                </header>

                <div className="relative w-full max-w-xl">
                    <div className="flex items-center rounded-lg border border-white/10 bg-card shadow-inner focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10">
                        <span className="pl-4 text-secondary">
                            <SearchIcon className="h-4 w-4" />
                        </span>
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search movies by title..."
                            className="flex-1 bg-transparent px-3 py-3 text-sm text-primary placeholder:text-tertiary focus:outline-none"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="pr-4 text-tertiary transition-colors hover:text-primary">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {dashboard.error && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        Could not load movies. Make sure the backend is running.
                    </div>
                )}

                {isSearching ? (
                    <section className="flex flex-col gap-4">
                        <SectionHeading>Search results</SectionHeading>
                        {search.isLoading ? (
                            <p className="text-sm text-secondary">Searching…</p>
                        ) : (
                            <MovieCarousel title="" movies={search.data?.movies ?? []} isLoading={false} />
                        )}
                        {!search.isLoading && (search.data?.movies.length ?? 0) === 0 && (
                            <p className="text-sm text-secondary">No movies found for &ldquo;{debouncedQuery}&rdquo;.</p>
                        )}
                    </section>
                ) : (
                    <div className="flex flex-col gap-10">
                        <MovieCarousel title="Trending Now" movies={dashboard.data?.trendingMovies ?? []} isLoading={pageLoading} />
                        {genreRows.map(({ genreName, movies }) => (
                            <MovieCarousel key={genreName} title={genreName} movies={movies} isLoading={pageLoading} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
