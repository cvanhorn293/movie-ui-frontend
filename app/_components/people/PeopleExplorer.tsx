"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPeople, searchAll } from "@/app/_lib/api";
import type { PersonSummary } from "@/app/_lib/types";
import { useFavorites } from "@/app/_hooks/useFavorites";
import SearchIcon from "@/app/_icons/Search.svg";
import PersonCard from "./PersonCard";
import PersonPanel from "./PersonPanel";

interface PeopleExplorerProps {
    department: "Acting" | "Directing";
    title: string;
    subtitle: string;
    rolePlural: string;
}

// Keep random pages within the first handful so results stay genuinely "popular".
const RANDOM_PAGE_COUNT = 5;

function seededShuffle<T>(items: T[], seed: number): T[] {
    const result = [...items];
    let state = Math.floor(seed * 2 ** 31) || 1;
    const next = () => {
        state = (state * 1664525 + 1013904223) % 2 ** 31;
        return state / 2 ** 31;
    };
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function PeopleGrid({ people, onSelect }: { people: PersonSummary[]; onSelect: (person: PersonSummary) => void }) {
    return (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {people.map((person) => (
                <PersonCard key={person.tmdbId} person={person} onSelect={onSelect} />
            ))}
        </div>
    );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="text-lg font-medium text-primary roboto-flex">{children}</h2>;
}

export default function PeopleExplorer({ department, title, subtitle, rolePlural }: PeopleExplorerProps) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedPerson, setSelectedPerson] = useState<PersonSummary | null>(null);
    const [shuffleSeed, setShuffleSeed] = useState(() => Math.random());

    const { favoritePeople } = useFavorites();

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 350);
        return () => clearTimeout(timeout);
    }, [query]);

    const isSearching = debouncedQuery.length > 0;
    const browsePage = (Math.floor(shuffleSeed * 1000) % RANDOM_PAGE_COUNT) + 1;

    const browse = useQuery({
        queryKey: ["people-browse", department, browsePage],
        queryFn: () => fetchPeople(department, browsePage),
        enabled: !isSearching,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const browseResults = useMemo(() => seededShuffle(browse.data?.results ?? [], shuffleSeed), [browse.data, shuffleSeed]);

    const search = useQuery({
        queryKey: ["people-search", debouncedQuery],
        queryFn: () => searchAll(debouncedQuery),
        enabled: isSearching,
        staleTime: 60 * 1000,
    });

    const searchResults = useMemo(
        () => (search.data?.people ?? []).filter((person) => (person.knownForDepartment ?? "").toLowerCase() === department.toLowerCase()),
        [search.data, department],
    );

    const favoritePersons = useMemo<PersonSummary[]>(
        () => favoritePeople.map((favorite) => ({ tmdbId: favorite.entityId, name: favorite.title, knownForDepartment: null, profileUrl: favorite.imageUrl })),
        [favoritePeople],
    );

    return (
        <>
            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold text-primary sm:text-3xl">{title}</h1>
                    <p className="max-w-2xl text-sm text-secondary">{subtitle}</p>
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
                            placeholder={`Search ${rolePlural} by name...`}
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

                {isSearching ? (
                    <section className="flex flex-col gap-4">
                        <SectionHeading>Search results</SectionHeading>
                        {search.isLoading ? (
                            <p className="text-sm text-secondary">Searching…</p>
                        ) : searchResults.length > 0 ? (
                            <PeopleGrid people={searchResults} onSelect={setSelectedPerson} />
                        ) : (
                            <p className="text-sm text-secondary">
                                No {rolePlural} found for &ldquo;{debouncedQuery}&rdquo;.
                            </p>
                        )}
                    </section>
                ) : (
                    <div className="flex flex-col gap-10">
                        {favoritePersons.length > 0 && (
                            <section className="flex flex-col gap-4">
                                <SectionHeading>Your favorites</SectionHeading>
                                <PeopleGrid people={favoritePersons} onSelect={setSelectedPerson} />
                            </section>
                        )}

                        <section className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-3">
                                <SectionHeading>Popular {rolePlural}</SectionHeading>
                                {browseResults.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShuffleSeed(Math.random())}
                                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-white/20 hover:text-primary"
                                    >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.34 5.34M4 15a8 8 0 0013.66 3.66" />
                                        </svg>
                                        Shuffle
                                    </button>
                                )}
                            </div>
                            {browse.isLoading ? (
                                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                                    {Array.from({ length: 12 }).map((_, index) => (
                                        <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
                                    ))}
                                </div>
                            ) : browseResults.length > 0 ? (
                                <PeopleGrid people={browseResults} onSelect={setSelectedPerson} />
                            ) : (
                                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
                                    <p className="text-sm text-secondary">
                                        Use the search above to find {rolePlural}
                                        {favoritePersons.length === 0 ? " and save your favorites." : "."}
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>

            <PersonPanel person={selectedPerson} onClose={() => setSelectedPerson(null)} />
        </>
    );
}
