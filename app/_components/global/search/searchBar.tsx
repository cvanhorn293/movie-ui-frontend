"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchAll } from "@/app/_lib/api";
import { getPersonRole, getPersonRoleLabel } from "@/app/_lib/personUtils";
import { getPosterUrl } from "@/app/_lib/tmdb-images";
import SearchIcon from "@/app/_icons/Search.svg";

const PREVIEW_LIMIT = 4;
const DEBOUNCE_MS = 300;

interface SearchBarProps {
    variant?: "default" | "hero";
}

function SearchBarInner({ variant = "default" }: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const urlQuery = pathname === "/search" ? (searchParams.get("q") ?? "") : "";

    // Keep the input in sync when landing on /search?q=…
    useEffect(() => {
        setSearchQuery(urlQuery);
        setDebouncedQuery(urlQuery);
    }, [urlQuery]);

    // Debounce preview requests.
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedQuery(searchQuery.trim()), DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const search = useQuery({
        queryKey: ["global-search", debouncedQuery],
        queryFn: () => searchAll(debouncedQuery),
        enabled: debouncedQuery.length >= 2 && isOpen,
        staleTime: 60 * 1000,
    });

    const previewMovies = useMemo(() => (search.data?.movies ?? []).slice(0, PREVIEW_LIMIT), [search.data?.movies]);

    const previewPeople = useMemo(
        () =>
            (search.data?.people ?? [])
                .filter((person) => {
                    const role = getPersonRole(person.knownForDepartment);
                    return role === "actor" || role === "director";
                })
                .slice(0, PREVIEW_LIMIT),
        [search.data?.people],
    );

    const hasPreviewResults = previewMovies.length > 0 || previewPeople.length > 0;
    const showDropdown = isOpen && debouncedQuery.length >= 2;

    const navigateToSearch = useCallback(
        (query: string) => {
            const trimmed = query.trim();
            if (!trimmed) return;

            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        },
        [router],
    );

    const handleSearch = () => {
        navigateToSearch(searchQuery);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSearch();
        }

        if (event.key === "Escape") {
            setIsOpen(false);
        }
    };

    // Close the dropdown when clicking outside.
    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    const isHero = variant === "hero";

    return (
        <div ref={containerRef} className={`relative w-full ${isHero ? "max-w-2xl" : "max-w-xl"}`}>
            {/* Search input — same chrome as the rest of the top bar in both themes */}
            <div className="flex items-center rounded-lg border border-white/10 bg-card shadow-inner focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10">
                <button type="button" onClick={handleSearch} className="mr-1 cursor-pointer rounded-lg px-4 py-3 transition-colors" aria-label="Search">
                    <SearchIcon className="h-4 w-4 text-secondary" />
                </button>
                <input
                    name="search"
                    type="text"
                    value={searchQuery}
                    onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for movies, actors, or directors..."
                    className="flex-1 bg-transparent px-4 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none"
                    style={{ paddingLeft: "0.5rem" }}
                    autoComplete="off"
                    aria-expanded={showDropdown}
                    aria-controls="global-search-results"
                    role="combobox"
                />
            </div>

            {/* Live preview dropdown */}
            {showDropdown && (
                <div
                    id="global-search-results"
                    role="listbox"
                    className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-card shadow-2xl"
                >
                    {search.isLoading ? (
                        <p className="px-4 py-3 text-sm text-secondary">Searching…</p>
                    ) : search.isError ? (
                        <p className="px-4 py-3 text-sm text-red-300">Could not load results.</p>
                    ) : !hasPreviewResults ? (
                        <p className="px-4 py-3 text-sm text-secondary">No movies, actors, or directors found.</p>
                    ) : (
                        <div className="max-h-[min(70vh,28rem)] overflow-y-auto py-2">
                            {previewMovies.length > 0 && (
                                <div className="px-2 pb-2">
                                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-tertiary">Movies</p>
                                    <ul>
                                        {previewMovies.map((movie) => {
                                            const posterUrl = getPosterUrl(movie);
                                            return (
                                                <li key={movie.tmdbId}>
                                                    <Link
                                                        href={`/movies/${movie.tmdbId}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.05]"
                                                        role="option"
                                                    >
                                                        <div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-white/5">
                                                            {posterUrl ? (
                                                                <img src={posterUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center text-[9px] text-tertiary">N/A</div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-primary">{movie.title}</p>
                                                            <p className="text-xs text-secondary">{movie.releaseDate?.slice(0, 4) ?? "—"}</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {previewPeople.length > 0 && (
                                <div className="px-2 pb-2">
                                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-tertiary">People</p>
                                    <ul>
                                        {previewPeople.map((person) => {
                                            const role = getPersonRole(person.knownForDepartment);
                                            return (
                                                <li key={person.tmdbId}>
                                                    <Link
                                                        href={`/people?personId=${person.tmdbId}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.05]"
                                                        role="option"
                                                    >
                                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/5">
                                                            {person.profileUrl ? (
                                                                <img src={person.profileUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center text-xs font-semibold text-primary/70">{person.name.slice(0, 1)}</div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-primary">{person.name}</p>
                                                            <p className="text-xs text-secondary">{role ? getPersonRoleLabel(role) : person.knownForDepartment ?? "Person"}</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Jump to the full search results page */}
                    <div className="border-t border-white/10 px-2 py-2">
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-accent transition-colors hover:bg-white/[0.05]"
                        >
                            See all results for &ldquo;{debouncedQuery}&rdquo;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SearchBar(props: SearchBarProps) {
    return (
        <Suspense fallback={<div className={`h-11 w-full max-w-xl animate-pulse rounded-lg bg-white/5 ${props.variant === "hero" ? "max-w-2xl" : ""}`} />}>
            <SearchBarInner {...props} />
        </Suspense>
    );
}
