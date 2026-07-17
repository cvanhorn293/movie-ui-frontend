"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchAll } from "@/app/_lib/api";
import { getPersonRole } from "@/app/_lib/personUtils";
import type { PersonSummary } from "@/app/_lib/types";
import MovieCarousel from "@/app/_components/home/MovieCarousel";
import PersonCard from "@/app/_components/people/PersonCard";
import PersonPanel from "@/app/_components/people/PersonPanel";

function SectionHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="text-lg font-medium text-primary roboto-flex">{children}</h2>;
}

export default function SearchResults() {
    // Query comes from the global nav search: /search?q=…
    const searchParams = useSearchParams();
    const query = searchParams.get("q")?.trim() ?? "";
    const [selectedPerson, setSelectedPerson] = useState<PersonSummary | null>(null);

    const search = useQuery({
        queryKey: ["search", query],
        queryFn: () => searchAll(query),
        enabled: query.length > 0,
        staleTime: 60 * 1000,
    });

    const people = useMemo(
        () =>
            // Search can return crew/other departments; keep actors and directors only.
            (search.data?.people ?? []).filter((person) => {
                const role = getPersonRole(person.knownForDepartment);
                return role === "actor" || role === "director";
            }),
        [search.data?.people],
    );

    const movies = search.data?.movies ?? [];
    const hasResults = movies.length > 0 || people.length > 0;

    // Empty query - prompt to use the top search bar.
    if (!query) {
        return (
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-primary sm:text-3xl">Search</h1>
                <p className="text-sm text-secondary">Enter a movie title, actor, or director in the search bar above.</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold text-primary sm:text-3xl">Search results</h1>
                    <p className="text-sm text-secondary">Showing results for &ldquo;{query}&rdquo;</p>
                </header>

                {search.isLoading ? (
                    <p className="text-sm text-secondary">Searching…</p>
                ) : search.isError ? (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">Could not load search results. Make sure the backend is running.</div>
                ) : !hasResults ? (
                    <p className="text-sm text-secondary">No movies, actors, or directors found for &ldquo;{query}&rdquo;.</p>
                ) : (
                    <div className="flex flex-col gap-10">
                        {/* Movie matches */}
                        {movies.length > 0 && (
                            <section className="flex flex-col gap-4">
                                <SectionHeading>Movies</SectionHeading>
                                <MovieCarousel title="" movies={movies} isLoading={false} />
                            </section>
                        )}

                        {/* Actor / director matches */}
                        {people.length > 0 && (
                            <section className="flex flex-col gap-4">
                                <SectionHeading>People</SectionHeading>
                                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                                    {people.map((person) => (
                                        <PersonCard key={person.tmdbId} person={person} onSelect={setSelectedPerson} showRoleBadge />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {hasResults && !search.isLoading && (
                    <p className="text-xs text-tertiary">
                        Looking for something else? Try the page search on{" "}
                        <Link href="/movies" className="text-accent hover:underline">
                            Movies
                        </Link>{" "}
                        or{" "}
                        <Link href="/people" className="text-accent hover:underline">
                            People
                        </Link>
                        .
                    </p>
                )}
            </div>

            {/* Slide-over person detail */}
            <PersonPanel person={selectedPerson} onClose={() => setSelectedPerson(null)} />
        </>
    );
}
