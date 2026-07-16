"use client";

import Link from "next/link";
import type { MovieBrowseGenreRow, MovieSummary } from "@/app/_lib/types";
import { getPosterUrl, getSpotlightBackgroundUrl } from "@/app/_lib/tmdb-images";
import { ChevRight } from "@/app/_components/global/icons";

export function genreSectionId(genreName: string): string {
    return `genre-${genreName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function scrollToGenre(genreName: string) {
    document.getElementById(genreSectionId(genreName))?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const FEATURED_MIN_HEIGHT = "min-h-[320px] sm:min-h-[380px]";
const CATEGORY_COUNT = 10;

interface MoviesBrowseHeroProps {
    featuredMovie: MovieSummary | null;
    genreRows: MovieBrowseGenreRow[];
    isLoading?: boolean;
}

function CategoryButton({ genreName, coverUrl, onClick }: { genreName: string; coverUrl: string | null; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative h-full min-h-0 overflow-hidden rounded-lg bg-white/5 text-left transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
            {coverUrl ? (
                <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/10" />
            )}
            <div className="absolute inset-0 bg-[#04121D]/65 transition-colors group-hover:bg-[#04121D]/55" />
            <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[11px] font-semibold leading-tight text-white sm:text-xs">{genreName}</span>
        </button>
    );
}

export default function MoviesBrowseHero({ featuredMovie, genreRows, isLoading }: MoviesBrowseHeroProps) {
    const categories = genreRows.filter((row) => row.movies.length > 0).slice(0, CATEGORY_COUNT);

    if (isLoading) {
        return (
            <section className={`grid gap-4 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] lg:items-stretch`}>
                <div className={`relative ${FEATURED_MIN_HEIGHT} overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]`}>
                    <div className="absolute inset-y-0 right-0 w-[80%] animate-pulse bg-white/5" />
                    <div className="relative z-10 flex h-full w-[42%] flex-col justify-center gap-2 p-5">
                        <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
                        <div className="h-7 w-4/5 animate-pulse rounded bg-white/5" />
                        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
                    </div>
                </div>
                <div className={`flex ${FEATURED_MIN_HEIGHT} flex-col gap-2`}>
                    <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
                    <div className="grid flex-1 grid-cols-2 grid-rows-5 gap-2">
                        {Array.from({ length: CATEGORY_COUNT }).map((_, index) => (
                            <div key={index} className="animate-pulse rounded-lg bg-white/5" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!featuredMovie && categories.length === 0) {
        return null;
    }

    const backgroundUrl = featuredMovie ? getSpotlightBackgroundUrl(featuredMovie) : null;

    return (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] lg:items-stretch">
            {/* Featured movie panel */}
            {featuredMovie ? (
                <div className={`relative ${FEATURED_MIN_HEIGHT} overflow-hidden rounded-2xl border border-white/5 bg-[#04121D]`}>
                    <div
                        className="absolute inset-y-0 right-0 w-[80%] bg-cover bg-center"
                        style={
                            backgroundUrl
                                ? {
                                      backgroundImage: `url("${backgroundUrl}")`,
                                  }
                                : undefined
                        }
                    >
                        {!backgroundUrl && <div className="h-full w-full bg-white/5" />}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-[#04121D] via-[#04121D]/90 via-[25%] to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04121D]/70 via-transparent to-[#04121D]/30" />

                    <div className={`relative z-10 flex ${FEATURED_MIN_HEIGHT} w-full max-w-[42%] flex-col justify-center p-5 sm:p-6`}>
                        {featuredMovie.genreNames?.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1.5">
                                {featuredMovie.genreNames.slice(0, 3).map((genre) => (
                                    <span key={genre} className="rounded-md bg-black/40 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h2 className="hero-safe-text text-xl font-semibold leading-tight sm:text-2xl">{featuredMovie.title}</h2>

                        {featuredMovie.overview && <p className="hero-safe-muted mt-2 line-clamp-3 text-sm leading-relaxed">{featuredMovie.overview}</p>}

                        <div className="mt-4">
                            <Link
                                href={`/movies/${featuredMovie.tmdbId}`}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-gradient px-5 py-2.5 text-sm font-semibold text-[#04121D] transition-opacity hover:opacity-90"
                            >
                                View Movie
                                <ChevRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`flex ${FEATURED_MIN_HEIGHT} items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02]`}>
                    <p className="text-sm text-secondary">No featured movie available.</p>
                </div>
            )}

            {/* Genre jump grid — scrolls to the matching row below */}
            {categories.length > 0 && (
                <div className={`flex ${FEATURED_MIN_HEIGHT} flex-col gap-2`}>
                    <h3 className="shrink-0 text-xs font-semibold uppercase tracking-wide text-tertiary">Browse by genre</h3>
                    <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-5 gap-2">
                        {categories.map((row) => (
                            <CategoryButton
                                key={row.genreName}
                                genreName={row.genreName}
                                coverUrl={getPosterUrl(row.movies[0])}
                                onClick={() => scrollToGenre(row.genreName)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
