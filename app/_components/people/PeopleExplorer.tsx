"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchPeople, fetchPerson, searchAll } from "@/app/_lib/api";
import type { PersonSummary } from "@/app/_lib/types";
import { getPersonRole } from "@/app/_lib/personUtils";
import { useCategorizedFavoritePeople } from "@/app/_hooks/useCategorizedFavoritePeople";
import { useFavorites } from "@/app/_hooks/useFavorites";
import SearchIcon from "@/app/_icons/Search.svg";
import FavoritePersonCard from "./FavoritePersonCard";
import PaginationControls, { getTotalPages, paginateItems } from "./PaginationControls";
import PersonCard from "./PersonCard";
import PersonPanel from "./PersonPanel";
import SectionCard from "@/app/_components/home/SectionCard";

const RANDOM_PAGE_COUNT = 15;
const FAVORITES_PAGE_SIZE = 6;

function seededShuffle<T>(items: T[], seed: number): T[] {
    // Deterministic shuffle so the same seed always yields the same order.
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
                <PersonCard key={person.tmdbId} person={person} onSelect={onSelect} showRoleBadge />
            ))}
        </div>
    );
}

function FavoritePeopleList({ people, onSelect }: { people: PersonSummary[]; onSelect: (person: PersonSummary) => void }) {
    return (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {people.map((person) => (
                <FavoritePersonCard key={person.tmdbId} person={person} onSelect={onSelect} />
            ))}
        </div>
    );
}

function SectionHeading({ children, backgroundColor = false }: { children: React.ReactNode; backgroundColor?: boolean }) {
    return <h2 className={`w-full text-xl font-bold text-primary ${backgroundColor ? "border-l-4 border-l-accent bg-white/5 pl-4 py-2" : "bg-transparent"} roboto-flex`}>{children}</h2>;
}

function FavoritesSection({ title, people, page, onPageChange, onSelect }: { title: string; people: PersonSummary[]; page: number; onPageChange: (page: number) => void; onSelect: (person: PersonSummary) => void }) {
    const totalPages = getTotalPages(people.length, FAVORITES_PAGE_SIZE);
    const paginatedPeople = paginateItems(people, page, FAVORITES_PAGE_SIZE);

    if (people.length === 0) {
        return null;
    }

    return (
        <section className="flex flex-col gap-4">
            <SectionHeading>{title}</SectionHeading>
            <FavoritePeopleList people={paginatedPeople} onSelect={onSelect} />
            <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </section>
    );
}

function BrowseSection({ title, rolePlural, people, isLoading, onShuffle, onSelect, showShuffle }: { title: string; rolePlural: string; people: PersonSummary[]; isLoading: boolean; onShuffle: () => void; onSelect: (person: PersonSummary) => void; showShuffle: boolean }) {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <SectionHeading backgroundColor={true}>{title}</SectionHeading>
                {showShuffle && (
                    <button type="button" onClick={onShuffle} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-white/20 hover:text-primary">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.34 5.34M4 15a8 8 0 0013.66 3.66" />
                        </svg>
                        Shuffle
                    </button>
                )}
            </div>
            {isLoading ? (
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
                    ))}
                </div>
            ) : people.length > 0 ? (
                <PeopleGrid people={people} onSelect={onSelect} />
            ) : (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
                    <p className="text-sm text-secondary">Use the search above to find {rolePlural}.</p>
                </div>
            )}
        </section>
    );
}

export default function PeopleExplorer() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedPerson, setSelectedPerson] = useState<PersonSummary | null>(null);
    const [actorShuffleSeed, setActorShuffleSeed] = useState(() => Math.random());
    const [directorShuffleSeed, setDirectorShuffleSeed] = useState(() => Math.random());
    const [actorFavoritesPage, setActorFavoritesPage] = useState(1);
    const [directorFavoritesPage, setDirectorFavoritesPage] = useState(1);

    const { favoritePeople } = useFavorites();
    const { favoriteActors, favoriteDirectors } = useCategorizedFavoritePeople(favoritePeople);

    // Debounce local search input.
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 350);
        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        setActorFavoritesPage(1);
    }, [favoriteActors.length]);

    useEffect(() => {
        setDirectorFavoritesPage(1);
    }, [favoriteDirectors.length]);

    // Deep-link: /people?personId=… opens the side panel for that person.
    useEffect(() => {
        const rawPersonId = searchParams.get("personId");
        if (!rawPersonId) return;

        const personId = Number(rawPersonId);
        if (!Number.isFinite(personId)) return;

        let cancelled = false;

        fetchPerson(personId)
            .then((detail) => {
                if (cancelled) return;

                setSelectedPerson({
                    tmdbId: detail.tmdbId,
                    name: detail.name,
                    knownForDepartment: detail.knownForDepartment,
                    profileUrl: detail.profileUrl,
                });
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [searchParams]);

    const isSearching = debouncedQuery.length > 0;
    // Map shuffle seed → a browse API page so "Shuffle" loads a different set.
    const actorBrowsePage = (Math.floor(actorShuffleSeed * 1000) % RANDOM_PAGE_COUNT) + 1;
    const directorBrowsePage = (Math.floor(directorShuffleSeed * 1000) % RANDOM_PAGE_COUNT) + 1;

    const actorBrowse = useQuery({
        queryKey: ["people-browse", "Acting", actorBrowsePage],
        queryFn: () => fetchPeople("Acting", actorBrowsePage),
        enabled: !isSearching,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const directorBrowse = useQuery({
        queryKey: ["people-browse", "Directing", directorBrowsePage],
        queryFn: () => fetchPeople("Directing", directorBrowsePage),
        enabled: !isSearching,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const actorBrowseResults = useMemo(() => seededShuffle(actorBrowse.data?.results ?? [], actorShuffleSeed), [actorBrowse.data, actorShuffleSeed]);

    const directorBrowseResults = useMemo(() => seededShuffle(directorBrowse.data?.results ?? [], directorShuffleSeed), [directorBrowse.data, directorShuffleSeed]);

    const search = useQuery({
        queryKey: ["people-search", debouncedQuery],
        queryFn: () => searchAll(debouncedQuery),
        enabled: isSearching,
        staleTime: 60 * 1000,
    });

    const searchResults = useMemo(
        () =>
            (search.data?.people ?? []).filter((person) => {
                const role = getPersonRole(person.knownForDepartment);
                return role === "actor" || role === "director";
            }),
        [search.data],
    );

    const hasFavorites = favoriteActors.length > 0 || favoriteDirectors.length > 0;

    return (
        <>
            <div className="flex flex-col gap-8">
                {/* Page header */}
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold text-primary sm:text-3xl">People</h1>
                    <p className="max-w-2xl text-sm text-secondary">Search for actors and directors, explore their work, and save the ones you love to your collection.</p>
                </header>

                {/* Local people search */}
                <div className="relative w-full max-w-xl">
                    <div className="flex items-center rounded-lg border border-white/10 bg-card shadow-inner focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10">
                        <span className="pl-4 text-secondary">
                            <SearchIcon className="h-4 w-4" />
                        </span>
                        <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actors and directors by name..." className="flex-1 bg-transparent px-3 py-3 text-sm text-primary placeholder:text-tertiary focus:outline-none" />
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
                    /* Search results */
                    <section className="flex flex-col gap-4">
                        <SectionHeading>Search results</SectionHeading>
                        {search.isLoading ? (
                            <p className="text-sm text-secondary">Searching…</p>
                        ) : searchResults.length > 0 ? (
                            <PeopleGrid people={searchResults} onSelect={setSelectedPerson} />
                        ) : (
                            <p className="text-sm text-secondary">No actors or directors found for &ldquo;{debouncedQuery}&rdquo;.</p>
                        )}
                    </section>
                ) : (
                    <div className="flex flex-col gap-10">
                        {/* Saved people (when the user has any) */}
                        {hasFavorites && (
                            <SectionCard>
                                <div className="flex flex-col gap-8">
                                    <FavoritesSection title="Favorite actors" people={favoriteActors} page={actorFavoritesPage} onPageChange={setActorFavoritesPage} onSelect={setSelectedPerson} />
                                    <FavoritesSection title="Favorite directors" people={favoriteDirectors} page={directorFavoritesPage} onPageChange={setDirectorFavoritesPage} onSelect={setSelectedPerson} />
                                </div>
                            </SectionCard>
                        )}

                        {/* Popular browse grids with shuffle */}
                        <BrowseSection title="Popular actors" rolePlural="actors" people={actorBrowseResults} isLoading={actorBrowse.isLoading} onShuffle={() => setActorShuffleSeed(Math.random())} onSelect={setSelectedPerson} showShuffle={actorBrowseResults.length > 0} />
                        <BrowseSection title="Popular directors" rolePlural="directors" people={directorBrowseResults} isLoading={directorBrowse.isLoading} onShuffle={() => setDirectorShuffleSeed(Math.random())} onSelect={setSelectedPerson} showShuffle={directorBrowseResults.length > 0} />
                    </div>
                )}
            </div>

            {/* Slide-over person detail */}
            <PersonPanel person={selectedPerson} onClose={() => setSelectedPerson(null)} />
        </>
    );
}
