"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchAll } from "@/app/_lib/api";
import { useMovieCatalog } from "@/app/_hooks/useMovieCatalog";
import MovieCarousel from "@/app/_components/home/MovieCarousel";
import MoviesBrowseHero, { genreSectionId } from "@/app/_components/movies/MoviesBrowseHero";
import SearchIcon from "@/app/_icons/Search.svg";

function SectionHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="text-lg font-medium text-primary roboto-flex">{children}</h2>;
}

export default function MoviesExplorer() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Debounce so we don't hit the API on every keystroke.
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 350);
        return () => clearTimeout(timeout);
    }, [query]);

    const isSearching = debouncedQuery.length > 0;

    const { trendingMovies, genreRows, error, isLoading, isEnriching } = useMovieCatalog();

    const search = useQuery({
        queryKey: ["movies-search", debouncedQuery],
        queryFn: () => searchAll(debouncedQuery),
        enabled: isSearching,
        staleTime: 60 * 1000,
    });

    const pageLoading = isLoading || (isEnriching && genreRows.length === 0);

    // Prefer the 2nd trending title so the hero isn't the same as "Trending Now".
    const featuredMovie = useMemo(() => {
        if (trendingMovies.length > 1) {
            return trendingMovies[1];
        }

        const alternate = genreRows.flatMap((row) => row.movies).find((movie) => movie.tmdbId !== trendingMovies[0]?.tmdbId);
        return alternate ?? trendingMovies[0] ?? null;
    }, [trendingMovies, genreRows]);

    return (
        <div className="flex flex-col gap-8">
            {/* Page header */}
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-primary sm:text-3xl">Movies</h1>
                <p className="max-w-2xl text-sm text-secondary">Browse by genre, search for titles, and dive into full movie details.</p>
            </header>

            {/* Local movie search */}
            <div className="relative w-full max-w-xl">
                <div className="flex items-center rounded-lg border border-white/10 bg-card shadow-inner focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10">
                    <span className="pl-4 text-secondary">
                        <SearchIcon className="h-4 w-4" />
                    </span>
                    <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movies by title..." className="flex-1 bg-transparent px-3 py-3 text-sm text-primary placeholder:text-tertiary focus:outline-none" />
                    {query && (
                        <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="pr-4 text-tertiary transition-colors hover:text-primary">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Featured + genre jump grid (hidden while searching) */}
            {!isSearching && <MoviesBrowseHero featuredMovie={featuredMovie} genreRows={genreRows} isLoading={pageLoading} />}

            {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">Could not load movies. Make sure the backend is running.</div>}

            {isSearching ? (
                /* Search results mode */
                <section className="flex flex-col gap-4">
                    <SectionHeading>Search results</SectionHeading>
                    {search.isLoading ? <p className="text-sm text-secondary">Searching…</p> : <MovieCarousel title="" movies={search.data?.movies ?? []} isLoading={false} />}
                    {!search.isLoading && (search.data?.movies.length ?? 0) === 0 && <p className="text-sm text-secondary">No movies found for &ldquo;{debouncedQuery}&rdquo;.</p>}
                </section>
            ) : (
                /* Browse mode: trending + one row per genre */
                <div className="flex flex-col gap-10">
                    <div id={genreSectionId("Trending Now")}>
                        <MovieCarousel title="Trending Now" movies={trendingMovies} isLoading={isLoading} />
                    </div>
                    {genreRows.map(({ genreName, movies }) => (
                        <div key={genreName} id={genreSectionId(genreName)} className="scroll-mt-24">
                            <MovieCarousel title={genreName} movies={movies} isLoading={pageLoading} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
