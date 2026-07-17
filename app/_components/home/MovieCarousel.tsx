"use client";

import Link from "next/link";
import type { MovieSummary } from "@/app/_lib/types";
import { getPosterUrl } from "@/app/_lib/tmdb-images";
import { useFavorites } from "@/app/_hooks/useFavorites";
import { Favorited, Favorites } from "@/app/_components/global/icons";
import HorizontalScrollRow from "@/app/_components/global/HorizontalScrollRow";
import { useSettings } from "@/app/_hooks/useSettings";

interface MovieCarouselProps {
    title: string;
    movies: MovieSummary[];
    isLoading?: boolean;
    linkToDetail?: boolean;
}

/** Full cards fill the controlled content width; peeks live outside via HorizontalScrollRow bleed. */
const CARD_WIDTH = "w-[var(--carousel-card-width,calc((100%-1rem)/2))] shrink-0";

export default function MovieCarousel({ title, movies, isLoading, linkToDetail = true }: MovieCarouselProps) {
    const { isFavorited, toggleFavorite, isAuthenticated } = useFavorites();
    const { showRatings } = useSettings();

    return (
        <div className="flex flex-col gap-4">
            {title && <h2 className="text-xl font-bold text-primary border-l-4 border-l-accent bg-white/5 py-2 pl-4 roboto-flex">{title}</h2>}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div key={index} className={`aspect-[2/3] animate-pulse rounded-lg bg-white/5 ${CARD_WIDTH}`} style={{ width: "calc((100% - 5rem) / 6)" }} />
                    ))}
                </div>
            ) : /* No Movies */
            movies.length === 0 ? (
                <p className="text-sm font-medium text-secondary">No movies available.</p>
            ) : (
                /* Show Movies List */
                <HorizontalScrollRow ariaLabel={title || "Movies"} itemsPerPage="auto">
                    {movies.map((movie) => {
                        const posterUrl = getPosterUrl(movie);
                        const favorited = isFavorited(movie.tmdbId);

                        /* Movie Poster */
                        const poster = (
                            <div data-scroll-poster className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5">
                                {posterUrl ? <img src={posterUrl} alt={movie.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center px-2 text-center text-xs text-secondary">No poster</div>}

                                {/* Add to Favorites Button */}
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
                                        {favorited ? <Favorited className="h-4 w-4 text-accent" /> : <Favorites className="h-4 w-4 text-white" />}
                                    </button>
                                )}
                            </div>
                        );

                        return (
                            <article key={movie.tmdbId} className={`group/card ${CARD_WIDTH}`}>
                                {/* Link to Movie Detail */}
                                {linkToDetail ? (
                                    <Link href={`/movies/${movie.tmdbId}`} className="block rounded-lg transition-[box-shadow] hover:ring-2 hover:ring-accent/50">
                                        {poster}
                                    </Link>
                                ) : (
                                    /* Fallback for no link to detail */
                                    <div className="rounded-lg">{poster}</div>
                                )}

                                <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-primary">{movie.title}</h3>

                                <p className="text-xs text-secondary">
                                    {movie.releaseDate?.slice(0, 4) ?? "-"}
                                    {showRatings && movie.rating != null ? ` · ★ ${movie.rating.toFixed(1)}` : ""}
                                </p>
                            </article>
                        );
                    })}
                </HorizontalScrollRow>
            )}
        </div>
    );
}
