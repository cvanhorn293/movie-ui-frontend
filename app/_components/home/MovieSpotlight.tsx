"use client";

import Link from "next/link";
import type { MovieSummary } from "@/app/_lib/types";
import { getSpotlightBackgroundUrl } from "@/app/_lib/tmdb-images";
import { ChevRight, Favorited, Favorites } from "@/app/_components/global/icons";
import { useFavorites } from "@/app/_hooks/useFavorites";

interface MovieSpotlightProps {
    movie: MovieSummary | null;
    isLoading?: boolean;
}

export default function MovieSpotlight({ movie, isLoading }: MovieSpotlightProps) {
    const { isFavorited, toggleFavorite, isAuthenticated } = useFavorites();

    if (isLoading) {
        return (
            <section className="relative min-h-[75vh] w-full shrink-0 overflow-hidden">
                <div className="absolute inset-0 animate-pulse bg-white/5" />
            </section>
        );
    }

    if (!movie) {
        return (
            <section className="relative flex min-h-[75vh] w-full items-center justify-center overflow-hidden bg-card">
                <p className="relative z-10 text-secondary">No spotlight movie available.</p>
            </section>
        );
    }

    const backgroundUrl = getSpotlightBackgroundUrl(movie);
    const favorited = isFavorited(movie.tmdbId);

    return (
        <section
            className="relative min-h-[75vh] w-full shrink-0 overflow-hidden"
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
            {/* Gradients keep the title readable over the backdrop */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#04121D]/95 via-[#04121D]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04121D]/90 via-transparent to-[#04121D]/40" />

            {/* Title + CTAs sit in the lower-left of the hero — always light text on dark overlays */}
            <div className="relative z-10 flex min-h-[75vh] flex-col justify-end px-4 pt-24 pb-8 sm:px-6 sm:pb-10 md:max-w-[42%] lg:max-w-[38%]">
                {movie.genreNames?.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {movie.genreNames.slice(0, 3).map((genre) => (
                            <span key={genre} className="rounded-md bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                {genre}
                            </span>
                        ))}
                    </div>
                )}

                <h2 className="hero-safe-text text-4xl font-semibold sm:text-5xl">{movie.title}</h2>

                {movie.overview && <p className="hero-safe-muted mt-3 line-clamp-4 text-sm leading-relaxed sm:text-base">{movie.overview}</p>}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                        href={`/movies/${movie.tmdbId}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-gradient px-6 py-3 text-sm font-semibold text-[#04121D] transition-opacity hover:opacity-90"
                    >
                        View Movie
                        <ChevRight className="h-4 w-4" />
                    </Link>
                    {isAuthenticated && (
                        <button
                            type="button"
                            onClick={() => toggleFavorite(movie)}
                            aria-pressed={favorited}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/35 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                        >
                            {favorited ? <Favorited className="h-4 w-4 text-accent" /> : <Favorites className="h-4 w-4" />}
                            {favorited ? "Saved to Favorites" : "Save to Favorites"}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
