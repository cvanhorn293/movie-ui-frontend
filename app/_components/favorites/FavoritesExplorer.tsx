"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/app/_lib/api";
import { buildCollectionInsights, buildGenreStats, getAllMovies } from "@/app/_lib/dashboard-utils";
import { isPersonFavoriteEntity } from "@/app/_lib/personUtils";
import type { Favorite, FavoriteEntityType, PersonSummary } from "@/app/_lib/types";
import { useAuth } from "@/app/_hooks/useAuth";
import { useCategorizedFavoritePeople } from "@/app/_hooks/useCategorizedFavoritePeople";
import { useFavoriteMovies } from "@/app/_hooks/useFavoriteMovies";
import { useFavorites } from "@/app/_hooks/useFavorites";
import CollectionInsights from "@/app/_components/home/CollectionInsights";
import MovieCarousel from "@/app/_components/home/MovieCarousel";
import MovieDnaSection from "@/app/_components/home/MovieDnaSection";
import FavoritePersonCard from "@/app/_components/people/FavoritePersonCard";
import PaginationControls, { getTotalPages, paginateItems } from "@/app/_components/people/PaginationControls";
import PersonPanel from "@/app/_components/people/PersonPanel";
import { Favorited } from "@/app/_components/global/icons";

const FAVORITES_PAGE_SIZE = 6;

type FavoritesFilter = "all" | "movies" | "actors" | "directors";

const FILTERS: { id: FavoritesFilter; label: string; countKey: "total" | "movies" | "actors" | "directors" }[] = [
    { id: "all", label: "All", countKey: "total" },
    { id: "movies", label: "Movies", countKey: "movies" },
    { id: "actors", label: "Actors", countKey: "actors" },
    { id: "directors", label: "Directors", countKey: "directors" },
];

function getFavoriteTypeLabel(entityType: FavoriteEntityType): string {
    switch (entityType) {
        case "MOVIE":
            return "Movie";
        case "ACTOR":
            return "Actor";
        case "DIRECTOR":
            return "Director";
        default:
            return "Person";
    }
}

/** Movies go to detail pages; people open on the people browse route. */
function getFavoriteHref(favorite: Favorite): string | null {
    if (favorite.entityType === "MOVIE") {
        return `/movies/${favorite.entityId}`;
    }
    if (isPersonFavoriteEntity(favorite.entityType)) {
        return `/people?personId=${favorite.entityId}`;
    }
    return null;
}

function formatRelativeDate(isoDate: string): string {
    const created = new Date(isoDate).getTime();
    if (Number.isNaN(created)) {
        return "";
    }

    const days = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
        return "Today";
    }
    if (days === 1) {
        return "Yesterday";
    }
    if (days < 30) {
        return `${days}d ago`;
    }
    if (days < 365) {
        return `${Math.floor(days / 30)}mo ago`;
    }
    return `${Math.floor(days / 365)}y ago`;
}

function getCollectionAgeDays(favorites: Favorite[]): number | null {
    if (favorites.length === 0) {
        return null;
    }

    const oldest = Math.min(...favorites.map((favorite) => new Date(favorite.createdAt).getTime()));
    if (Number.isNaN(oldest)) {
        return null;
    }

    return Math.floor((Date.now() - oldest) / (1000 * 60 * 60 * 24));
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="text-xl font-bold text-primary border-l-4 border-l-accent bg-white/5 py-2 pl-4 roboto-flex">{children}</h2>;
}

function RowTitle({ children, featured = false }: { children: React.ReactNode; featured?: boolean }) {
    if (featured) {
        return <SectionHeading>{children}</SectionHeading>;
    }

    return <h3 className="text-lg font-medium text-primary roboto-flex">{children}</h3>;
}

function EmptyFilterState({ message, href, linkLabel }: { message: string; href: string; linkLabel: string }) {
    return (
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-sm text-secondary">{message}</p>
            <Link href={href} className="btn-secondary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-primary">
                {linkLabel}
            </Link>
        </div>
    );
}

function FavoritePeopleList({ people, onSelect }: { people: PersonSummary[]; onSelect: (person: PersonSummary) => void }) {
    return (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {people.map((person) => (
                <FavoritePersonCard key={person.tmdbId} person={person} onSelect={onSelect} />
            ))}
        </div>
    );
}

function PaginatedPeople({ people, page, onPageChange, onSelect }: { people: PersonSummary[]; page: number; onPageChange: (page: number) => void; onSelect: (person: PersonSummary) => void }) {
    const totalPages = getTotalPages(people.length, FAVORITES_PAGE_SIZE);
    const paginatedPeople = paginateItems(people, page, FAVORITES_PAGE_SIZE);

    return (
        <div className="flex flex-col gap-3">
            <FavoritePeopleList people={paginatedPeople} onSelect={onSelect} />
            <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
    );
}

// Recent favorites - shows most recently added favorite
function RecentFavoritesStrip({ favorites }: { favorites: Favorite[] }) {
    if (favorites.length === 0) {
        return null;
    }

    return (
        <section className="flex flex-col gap-4">
            <SectionHeading>Recently saved</SectionHeading>
            <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
                {favorites.map((favorite) => {
                    const href = getFavoriteHref(favorite);
                    const content = (
                        <>
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                                {favorite.imageUrl ? <img src={favorite.imageUrl} alt={favorite.title} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-[10px] text-secondary">N/A</div>}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 text-sm font-medium text-primary">{favorite.title}</p>
                                <p className="mt-0.5 text-xs text-secondary">
                                    {getFavoriteTypeLabel(favorite.entityType)} · {formatRelativeDate(favorite.createdAt)}
                                </p>
                            </div>
                        </>
                    );

                    const className = "flex min-w-[220px] max-w-[260px] shrink-0 items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:border-white/15 hover:bg-white/[0.04]";

                    return href ? (
                        <Link key={`${favorite.entityType}-${favorite.entityId}-${favorite.id}`} href={href} className={className}>
                            {content}
                        </Link>
                    ) : (
                        <div key={`${favorite.entityType}-${favorite.entityId}-${favorite.id}`} className={className}>
                            {content}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function CollectionFilterBar({ filter, onFilterChange, counts }: { filter: FavoritesFilter; onFilterChange: (filter: FavoritesFilter) => void; counts: Record<"total" | "movies" | "actors" | "directors", number> }) {
    return (
        <div role="tablist" aria-label="Collection filters" className="flex flex-wrap gap-1">
            {FILTERS.map((item) => {
                const active = filter === item.id;
                const count = counts[item.countKey];

                return (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onFilterChange(item.id)}
                        className={`relative inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${active ? "text-primary" : "text-secondary hover:text-primary"}`}
                    >
                        <span>{item.label}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums transition-colors ${active ? "bg-accent-soft text-accent" : "bg-white/5 text-tertiary"}`}>{count}</span>
                        <span className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-all duration-300 ${active ? "scale-x-100 bg-accent opacity-100" : "scale-x-50 bg-transparent opacity-0"}`} aria-hidden />
                    </button>
                );
            })}
        </div>
    );
}

export default function FavoritesExplorer() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { favorites, favoritePeople } = useFavorites();
    const { favoriteActors, favoriteDirectors } = useCategorizedFavoritePeople(favoritePeople);

    const [filter, setFilter] = useState<FavoritesFilter>("all");
    const [actorPage, setActorPage] = useState(1);
    const [directorPage, setDirectorPage] = useState(1);
    const [selectedPerson, setSelectedPerson] = useState<PersonSummary | null>(null);

    // Dashboard powers DNA stats and collection insights.
    const { data: dashboard, isLoading: dashboardLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboard,
        enabled: isAuthenticated,
    });

    // Newest movie favorites first; enrich with full movie details when available.
    const movieFavorites = useMemo(() => favorites.filter((favorite) => favorite.entityType === "MOVIE").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [favorites]);
    const { movies: favoriteMovies, isLoading: moviesLoading } = useFavoriteMovies(movieFavorites);
    const recentFavorites = useMemo(() => [...favorites].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10), [favorites]);

    const genreStats = useMemo(() => buildGenreStats(dashboard ? getAllMovies(dashboard) : []), [dashboard]);

    // Prefer live favorite data over dashboard defaults where we have it.
    const insights = useMemo(() => {
        if (!dashboard) {
            return null;
        }

        const base = buildCollectionInsights(dashboard, genreStats);
        const collectionAgeDays = getCollectionAgeDays(favorites) ?? base.collectionAgeDays;
        const recentFavorite = recentFavorites[0] ?? base.recentFavorite;
        const favoriteDirector = favoriteDirectors[0]?.name ?? base.favoriteDirector;

        return {
            ...base,
            collectionAgeDays,
            recentFavorite,
            favoriteDirector,
        };
    }, [dashboard, genreStats, favorites, recentFavorites, favoriteDirectors]);

    const movieCount = dashboard?.movieCount ?? movieFavorites.length;
    const personCount = dashboard?.personCount ?? favoritePeople.length;
    const totalCount = dashboard?.favoriteCount ?? favorites.length;
    const collectionAge = insights?.collectionAgeDays ?? null;

    const dnaStats = useMemo(
        () => [
            { label: "Total saved", value: totalCount.toLocaleString(), accent: true },
            { label: "Movies", value: movieCount.toLocaleString() },
            { label: "People", value: personCount.toLocaleString() },
            { label: "Collection age", value: collectionAge != null ? `${collectionAge}d` : "-" },
        ],
        [totalCount, movieCount, personCount, collectionAge],
    );

    const tabCounts = useMemo(
        () => ({
            total: favorites.length,
            movies: movieFavorites.length,
            actors: favoriteActors.length,
            directors: favoriteDirectors.length,
        }),
        [favorites.length, movieFavorites.length, favoriteActors.length, favoriteDirectors.length],
    );

    const pageLoading = authLoading || (isAuthenticated && dashboardLoading && favorites.length === 0);
    const hasAnyFavorites = favorites.length > 0;
    const showMovies = filter === "all" || filter === "movies";
    const showActors = filter === "all" || filter === "actors";
    const showDirectors = filter === "all" || filter === "directors";
    const showAllGroups = filter === "all";

    const actorTotalPages = getTotalPages(favoriteActors.length, FAVORITES_PAGE_SIZE);
    const directorTotalPages = getTotalPages(favoriteDirectors.length, FAVORITES_PAGE_SIZE);
    const safeActorPage = Math.min(actorPage, actorTotalPages);
    const safeDirectorPage = Math.min(directorPage, directorTotalPages);

    const handleFilterChange = (next: FavoritesFilter) => {
        setFilter(next);
        setActorPage(1);
        setDirectorPage(1);
    };

    return (
        <>
            <div className="flex flex-col gap-8">
                {/* Page header */}
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold text-primary sm:text-3xl">Favorites</h1>
                    <p className="max-w-2xl text-sm text-secondary">Your saved movies, actors, and directors - revisit what you love and keep building your collection.</p>
                </header>

                {/* Signed-out prompt */}
                {!authLoading && !isAuthenticated && (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
                        <div>
                            <h3 className="text-base font-semibold text-primary">Sign in to see your favorites</h3>
                            <p className="mt-1 text-sm text-secondary">Save movies and people as you browse, then come back here to manage your collection.</p>
                        </div>
                        <Link href="/login" className="btn-gradient inline-flex shrink-0 items-center justify-center rounded-xl px-6 py-2.5 text-sm font-medium">
                            <span className="btn-gradient-text">Sign in</span>
                        </Link>
                    </div>
                )}

                {isAuthenticated && (
                    <>
                        {pageLoading ? (
                            <div className="flex flex-col gap-6">
                                <div className="h-28 animate-pulse rounded-xl bg-white/5" />
                                <div className="h-64 animate-pulse rounded-xl bg-white/5" />
                            </div>
                        ) : (
                            <>
                                {/* Recent saves strip */}
                                {hasAnyFavorites && <RecentFavoritesStrip favorites={recentFavorites} />}

                                {/* Collection DNA + insight cards */}
                                <MovieDnaSection data={dashboard} isLoading={pageLoading} plain stats={dnaStats} />
                                {insights && <CollectionInsights insights={insights} isLoading={pageLoading} />}

                                {!hasAnyFavorites ? (
                                    /* Empty collection state */
                                    <div className="flex flex-col items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-6 py-14 text-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent-soft">
                                            <Favorited className="h-6 w-6 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-primary">Nothing saved yet</h3>
                                            <p className="mt-1 max-w-md text-sm text-secondary">Start building your collection by favoriting movies and people as you explore.</p>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-3">
                                            <Link href="/movies" className="btn-gradient inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium">
                                                <span className="btn-gradient-text">Browse movies</span>
                                            </Link>
                                            <Link href="/people" className="btn-secondary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-primary">
                                                Browse people
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    /* Filtered collection: movies, actors, directors */
                                    <section className="relative flex flex-col gap-8">
                                        <div className="pointer-events-none absolute -top-10 left-0 h-44 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden />
                                        <div className="pointer-events-none absolute -top-6 right-10 h-32 w-56 rounded-full bg-accent/5 blur-3xl" aria-hidden />

                                        <div className="relative flex flex-col gap-4">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                                <div>
                                                    <h2 className="mt-1 text-2xl font-semibold text-accent roboto-flex">Your collection</h2>
                                                    <p className="mt-1 max-w-xl text-sm text-secondary">Browse everything you have saved - movies first, people just below.</p>
                                                </div>
                                                <CollectionFilterBar filter={filter} onFilterChange={handleFilterChange} counts={tabCounts} />
                                            </div>
                                            <div className="h-px w-full bg-gradient-to-r from-accent/40 via-white/10 to-transparent" aria-hidden />
                                        </div>

                                        <div className="relative flex flex-col gap-10">
                                            {showMovies && (
                                                <div>
                                                    {favoriteMovies.length > 0 ? (
                                                        <MovieCarousel title={showAllGroups || filter === "movies" ? "Movies" : ""} movies={favoriteMovies} isLoading={moviesLoading} />
                                                    ) : filter === "movies" ? (
                                                        <EmptyFilterState message="No favorite movies yet." href="/movies" linkLabel="Browse movies" />
                                                    ) : null}
                                                </div>
                                            )}

                                            {showActors && (favoriteActors.length > 0 || filter === "actors") && (
                                                <div className="flex flex-col gap-4">
                                                    {favoriteActors.length > 0 && <RowTitle featured={filter === "actors"}>Actors</RowTitle>}
                                                    {favoriteActors.length > 0 ? (
                                                        <PaginatedPeople people={favoriteActors} page={safeActorPage} onPageChange={setActorPage} onSelect={setSelectedPerson} />
                                                    ) : (
                                                        <EmptyFilterState message="No favorite actors yet." href="/people" linkLabel="Browse people" />
                                                    )}
                                                </div>
                                            )}

                                            {showDirectors && (favoriteDirectors.length > 0 || filter === "directors") && (
                                                <div className="flex flex-col gap-4">
                                                    {favoriteDirectors.length > 0 && <RowTitle featured={filter === "directors"}>Directors</RowTitle>}
                                                    {favoriteDirectors.length > 0 ? (
                                                        <PaginatedPeople people={favoriteDirectors} page={safeDirectorPage} onPageChange={setDirectorPage} onSelect={setSelectedPerson} />
                                                    ) : (
                                                        <EmptyFilterState message="No favorite directors yet." href="/people" linkLabel="Browse people" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Slide-over person detail */}
            <PersonPanel person={selectedPerson} onClose={() => setSelectedPerson(null)} />
        </>
    );
}
