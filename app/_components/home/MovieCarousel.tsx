"use client";

import Link from "next/link";
import type { MovieSummary } from "@/app/_lib/types";
import { getPosterUrl } from "@/app/_lib/tmdb-images";
import { useFavorites } from "@/app/_hooks/useFavorites";
import { Favorited, Favorites } from "@/app/_components/global/icons";
import HorizontalScrollRow from "@/app/_components/global/HorizontalScrollRow";

interface MovieCarouselProps {
    title: string;
    movies: MovieSummary[];
    isLoading?: boolean;
    linkToDetail?: boolean;
}

const CARD_WIDTH = "shrink-0 basis-[44%] sm:basis-[30%] md:basis-[22%] lg:basis-[calc((100%-6rem)/6.5)]";

export default function MovieCarousel({ title, movies, isLoading, linkToDetail = true }: MovieCarouselProps) {
    const { isFavorited, toggleFavorite, isAuthenticated } = useFavorites();

    return (
        <div className="flex flex-col gap-4">
            {title && <h2 className="text-xl font-bold text-[#F7F8F9] border-l-4 border-l-[#38FDCF] bg-white/5 py-2 pl-4 roboto-flex">{title}</h2>}
            {/* {title && <h2 className="text-lg font-medium text-primary roboto-flex">{title}</h2>} */}
            {isLoading ? (
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className={`aspect-[2/3] animate-pulse rounded-lg bg-white/5 ${CARD_WIDTH}`} />
                    ))}
                </div>
            ) : movies.length === 0 ? (
                <p className="text-sm text-secondary">No movies available.</p>
            ) : (
                <HorizontalScrollRow ariaLabel={title || "Movies"}>
                    {movies.map((movie) => {
                        const posterUrl = getPosterUrl(movie);
                        const favorited = isFavorited(movie.tmdbId);

                        const poster = (
                            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5 transition-transform group-hover:scale-[1.02]">
                                {posterUrl ? <img src={posterUrl} alt={movie.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center px-2 text-center text-xs text-secondary">No poster</div>}

                                {isAuthenticated && (
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            toggleFavorite(movie);
                                        }}
                                        aria-label={favorited ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
                                        aria-pressed={favorited}
                                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/65"
                                    >
                                        {favorited ? <Favorited className="h-4 w-4 text-[#38FDCF]" /> : <Favorites className="h-4 w-4 text-white" />}
                                    </button>
                                )}
                            </div>
                        );

                        return (
                            <article key={movie.tmdbId} className={`group ${CARD_WIDTH}`}>
                                {linkToDetail ? (
                                    <Link href={`/movies/${movie.tmdbId}`} className="block">
                                        {poster}
                                    </Link>
                                ) : (
                                    poster
                                )}

                                <h3 className="mt-2 line-clamp-2 text-sm font-medium text-primary">{movie.title}</h3>

                                <p className="text-xs text-secondary">
                                    {movie.releaseDate?.slice(0, 4) ?? "—"}
                                    {movie.rating != null ? ` · ★ ${movie.rating.toFixed(1)}` : ""}
                                </p>
                            </article>
                        );
                    })}
                </HorizontalScrollRow>
            )}
        </div>
    );
}
