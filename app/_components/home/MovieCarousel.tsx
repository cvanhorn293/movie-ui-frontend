"use client";

import { useRef } from "react";
import type { MovieSummary } from "@/app/_lib/types";
import { getPosterUrl } from "@/app/_lib/tmdb-images";

interface MovieCarouselProps {
    title: string;
    movies: MovieSummary[];
    isLoading?: boolean;
}

export default function MovieCarousel({ title, movies, isLoading }: MovieCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-56 w-36 shrink-0 animate-pulse rounded-lg bg-white/5" />
                    ))}
                </div>
            ) : movies.length === 0 ? (
                <p className="text-sm text-secondary">No movies available.</p>
            ) : (
                <div ref={scrollContainerRef} onWheel={handleWheel} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
                    {movies.map((movie) => {
                        const posterUrl = getPosterUrl(movie);

                        return (
                            <article key={movie.tmdbId} className="w-36 shrink-0">
                                <div className="aspect-[2/3] overflow-hidden rounded-lg bg-white/5">
                                    {posterUrl ? <img src={posterUrl} alt={movie.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center px-2 text-center text-xs text-secondary">No poster</div>}
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
