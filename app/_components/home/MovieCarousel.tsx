"use client";

import { useRef } from "react";
import type { MovieSummary } from "@/app/_lib/types";
import { getPosterUrl } from "@/app/_lib/tmdb-images";
import { useFavorites } from "@/app/_hooks/useFavorites";
import { Favorited, Favorites } from "@/app/_components/global/icons";

interface MovieCarouselProps {
    title: string;
    movies: MovieSummary[];
    isLoading?: boolean;
}

const CARD_WIDTH = "shrink-0 basis-[44%] sm:basis-[30%] md:basis-[22%] lg:basis-[calc((100%-6rem)/6.5)]";

export default function MovieCarousel({ title, movies, isLoading }: MovieCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { isFavorited, toggleFavorite, isAuthenticated } = useFavorites();

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        if (container.scrollWidth > container.clientWidth) {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {title && <h2 className="text-lg font-medium text-primary roboto-flex">{title}</h2>}
            {isLoading ? (
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className={`aspect-[2/3] animate-pulse rounded-lg bg-white/5 ${CARD_WIDTH}`} />
                    ))}
                </div>
            ) : movies.length === 0 ? (
                <p className="text-sm text-secondary">No movies available.</p>
            ) : (
                <div ref={scrollContainerRef} onWheel={handleWheel} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
                    {movies.map((movie) => {
                        const posterUrl = getPosterUrl(movie);
                        const favorited = isFavorited(movie.tmdbId);

                        return (
                            <article key={movie.tmdbId} className={CARD_WIDTH}>
                                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5">
                                    {posterUrl ? (
                                        <img src={posterUrl} alt={movie.title} className="h-full w-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center px-2 text-center text-xs text-secondary">No poster</div>
                                    )}

                                    {isAuthenticated && (
                                        <button
                                            type="button"
                                            onClick={() => toggleFavorite(movie)}
                                            aria-label={favorited ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
                                            aria-pressed={favorited}
                                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/65"
                                        >
                                            {favorited ? <Favorited className="h-4 w-4 text-[#38FDCF]" /> : <Favorites className="h-4 w-4 text-white" />}
                                        </button>
                                    )}
                                </div>

                                <h3 className="mt-2 line-clamp-2 text-sm font-medium text-primary">{movie.title}</h3>

                                <p className="text-xs text-secondary">
                                    {movie.releaseDate?.slice(0, 4) ?? "—"}
                                    {movie.rating != null ? ` · ★ ${movie.rating.toFixed(1)}` : ""}
                                </p>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
