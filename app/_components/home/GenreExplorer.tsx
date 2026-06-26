import type { MovieSummary } from "@/app/_lib/types";
import { getPosterUrl } from "@/app/_lib/tmdb-images";
import { getGenreDescription } from "@/app/_lib/genre-descriptions";

interface GenreExplorerProps {
    selectedGenre: string | null;
    topMovies: MovieSummary[];
    percentage: number | null;
    rank: number | null;
    titleCount: number;
    avgRating: number | null;
    className?: string;
}

export default function GenreExplorer({ selectedGenre, topMovies, rank, className = "" }: GenreExplorerProps) {
    return (
        <div className={`flex flex-col rounded-xl border border-white/5 bg-white/[0.02] p-5 ${className}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-tertiary">Genre spotlight</p>

            {!selectedGenre ? (
                <p className="mt-3 text-sm text-secondary">Select a slice or genre to surface its story and highest-rated titles.</p>
            ) : (
                <>
                    <div className="mt-1 flex items-center gap-2.5">
                        <h3 className="text-xl font-semibold text-primary">{selectedGenre}</h3>
                        {rank === 1 ? <span className="rounded-full bg-[#38FDCF]/15 px-2.5 py-0.5 text-xs font-medium text-[#38FDCF]">Top genre</span> : rank != null && <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-secondary">#{rank}</span>}
                    </div>

                    <p className="mt-2.5 text-sm leading-relaxed text-secondary">{getGenreDescription(selectedGenre)}</p>

                    <div className="mt-5 flex-1">
                        <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-tertiary">Highest rated</p>
                        {topMovies.length === 0 ? (
                            <p className="text-sm text-secondary">No titles for this genre in your collection yet.</p>
                        ) : (
                            <ul className="grid gap-x-5 gap-y-2.5 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-3">
                                {topMovies.map((movie, index) => {
                                    const posterUrl = getPosterUrl(movie);
                                    const year = movie.releaseDate?.slice(0, 4);
                                    return (
                                        <li key={movie.tmdbId} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.04]">
                                            <span className="w-4 shrink-0 text-center text-sm font-semibold text-tertiary tabular-nums">{index + 1}</span>
                                            <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md bg-white/5">
                                                {posterUrl ? <img src={posterUrl} alt={movie.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-[10px] text-tertiary">N/A</div>}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-primary">{movie.title}</p>
                                                <p className="mt-0.5 flex items-center gap-2 text-xs text-secondary">
                                                    {year && <span>{year}</span>}
                                                    {movie.rating != null && (
                                                        <span className="flex items-center gap-1 text-[#38FDCF]">
                                                            <span aria-hidden>★</span>
                                                            {movie.rating.toFixed(1)}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
