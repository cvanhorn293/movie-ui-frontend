"use client";

import Link from "next/link";
import type { MovieCastMember, MovieCrewMember, MovieDetail, MovieSummary } from "@/app/_lib/types";
import { formatCurrency, formatLanguage, formatReleaseDate, formatRuntime, getInitials } from "@/app/_lib/movie-formatters";
import { getSpotlightBackgroundUrl } from "@/app/_lib/tmdb-images";
import { Favorited, Favorites } from "@/app/_components/global/icons";
import { useFavorites } from "@/app/_hooks/useFavorites";
import MovieCarousel from "@/app/_components/home/MovieCarousel";
import HorizontalScrollRow from "@/app/_components/global/HorizontalScrollRow";

interface MovieDetailViewProps {
    movie: MovieDetail;
    similarMovies: MovieSummary[];
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="text-lg font-medium text-primary roboto-flex">{children}</h2>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4">
            <span className="w-36 shrink-0 text-xs uppercase tracking-wide text-tertiary">{label}</span>
            <span className="text-sm text-primary">{value}</span>
        </div>
    );
}

function CastCard({ member }: { member: MovieCastMember }) {
    return (
        <div className="flex w-28 shrink-0 flex-col sm:w-32">
            <div className="aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/5">
                {member.profileUrl ? (
                    <img src={member.profileUrl} alt={member.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-500/15 to-teal-500/10 text-lg font-semibold text-primary/70">
                        {getInitials(member.name)}
                    </div>
                )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-primary">{member.name}</p>
            {member.character && <p className="line-clamp-2 text-xs text-secondary">{member.character}</p>}
        </div>
    );
}

function ActionButton({ label, children, onClick, href, pressed }: { label: string; children: React.ReactNode; onClick?: () => void; href?: string; pressed?: boolean }) {
    const content = (
        <>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-sm transition-colors group-hover:border-white/40">
                {children}
            </span>
            <span className="text-xs">{label}</span>
        </>
    );

    const className = "group flex flex-col items-center gap-2 text-secondary transition-colors hover:text-primary";

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} aria-pressed={pressed} className={className}>
            {content}
        </button>
    );
}

function ScrollIndicator({ targetId }: { targetId: string }) {
    const handleScroll = () => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <button
            type="button"
            onClick={handleScroll}
            aria-label="Scroll to more content"
            className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-secondary transition-colors hover:text-primary"
        >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-sm animate-bounce">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </span>
        </button>
    );
}

function CrewList({ crew }: { crew: MovieCrewMember[] }) {
    if (crew.length === 0) {
        return null;
    }

    return (
        <section className="flex flex-col gap-4">
            <SectionHeading>Key crew</SectionHeading>
            <div className="divide-y divide-white/5 rounded-xl border border-white/5 bg-white/[0.02] px-5">
                {crew.map((member) => (
                    <DetailRow key={`${member.tmdbId}-${member.job}`} label={member.job ?? "Crew"} value={member.name} />
                ))}
            </div>
        </section>
    );
}

export default function MovieDetailView({ movie, similarMovies }: MovieDetailViewProps) {
    const { isFavorited, toggleFavorite, isAuthenticated } = useFavorites();
    const backgroundUrl = getSpotlightBackgroundUrl(movie);
    const favorited = isFavorited(movie.tmdbId);
    const cast = movie.cast ?? [];
    const crew = movie.crew ?? [];

    const details = [
        { label: "Release date", value: formatReleaseDate(movie.releaseDate) },
        { label: "Runtime", value: formatRuntime(movie.runtimeMinutes) },
        { label: "Rating", value: movie.rating != null ? `${movie.rating.toFixed(1)} / 10` : null },
        { label: "Status", value: movie.status },
        { label: "Original language", value: formatLanguage(movie.originalLanguage) },
        { label: "Budget", value: formatCurrency(movie.budget) },
        { label: "Box office", value: formatCurrency(movie.revenue) },
        {
            label: "Production",
            value: movie.productionCountries && movie.productionCountries.length > 0 ? movie.productionCountries.join(", ") : null,
        },
    ].filter((entry): entry is { label: string; value: string } => Boolean(entry.value));

    return (
        <div className="flex w-full flex-col">
            <section
                className="relative min-h-screen w-full overflow-hidden"
                style={
                    backgroundUrl
                        ? {
                              backgroundImage: `url("${backgroundUrl}")`,
                              backgroundSize: "cover",
                              backgroundPosition: "center top",
                          }
                        : undefined
                }
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#04121D]/95 via-[#04121D]/60 to-[#04121D]/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04121D] via-[#04121D]/40 to-transparent" />

                <div className="absolute top-28 right-8 left-8 z-20 flex items-start justify-between">
                    <ActionButton label="Browse" href="/movies">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </ActionButton>

                    {isAuthenticated && (
                        <ActionButton label={favorited ? "Favorited" : "Favorite"} onClick={() => toggleFavorite(movie)} pressed={favorited}>
                            {favorited ? <Favorited className="h-5 w-5 text-[#38FDCF]" /> : <Favorites className="h-5 w-5" />}
                        </ActionButton>
                    )}
                </div>

                <div className="relative z-10 flex min-h-screen flex-col justify-end px-4 pb-20 pt-28 sm:px-6 lg:px-10">
                    <div className="max-w-3xl">
                        {movie.genreNames?.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {movie.genreNames.map((genre) => (
                                    <span key={genre} className="rounded-md bg-black/40 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 className="text-4xl font-semibold uppercase tracking-wide text-primary sm:text-5xl lg:text-6xl">{movie.title}</h1>

                        {movie.tagline && <p className="mt-3 text-base italic text-secondary sm:text-lg">&ldquo;{movie.tagline}&rdquo;</p>}

                        {movie.overview && <p className="mt-5 max-w-2xl text-sm leading-relaxed text-secondary sm:text-base">{movie.overview}</p>}
                    </div>
                </div>

                <ScrollIndicator targetId="movie-detail-content" />
            </section>

            <div id="movie-detail-content" className="container mx-auto flex flex-col gap-10 px-4 py-10 sm:px-6">
                {cast.length > 0 && (
                    <section className="flex flex-col gap-4">
                        <SectionHeading>Cast</SectionHeading>
                        <HorizontalScrollRow ariaLabel="Cast" controlsInsetBottom="3.25rem">
                            {cast.map((member) => (
                                <CastCard key={`${member.tmdbId}-${member.character ?? member.name}`} member={member} />
                            ))}
                        </HorizontalScrollRow>
                    </section>
                )}

                {details.length > 0 && (
                    <section className="flex flex-col gap-4">
                        <SectionHeading>Details</SectionHeading>
                        <div className="divide-y divide-white/5 rounded-xl border border-white/5 bg-white/[0.02] px-5">
                            {details.map((entry) => (
                                <DetailRow key={entry.label} label={entry.label} value={entry.value} />
                            ))}
                        </div>
                    </section>
                )}

                <CrewList crew={crew} />

                {similarMovies.length > 0 && <MovieCarousel title="Movies you might like" movies={similarMovies} />}
            </div>
        </div>
    );
}

export function MovieDetailSkeleton() {
    return (
        <div className="flex w-full flex-col">
            <section className="relative min-h-screen w-full overflow-hidden">
                <div className="absolute inset-0 animate-pulse bg-white/5" />
                <div className="relative z-10 flex min-h-screen flex-col justify-end px-4 pb-20 pt-28 sm:px-6">
                    <div className="mb-4 flex gap-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-6 w-16 animate-pulse rounded-md bg-white/10" />
                        ))}
                    </div>
                    <div className="h-12 w-2/3 max-w-md animate-pulse rounded-lg bg-white/10" />
                    <div className="mt-6 space-y-2">
                        <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                        <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                    </div>
                </div>
            </section>
            <div className="container mx-auto flex flex-col gap-8 px-4 py-10 sm:px-6">
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-48 w-28 shrink-0 animate-pulse rounded-lg bg-white/5" />
                    ))}
                </div>
            </div>
        </div>
    );
}
