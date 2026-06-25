import type { MovieSummary } from "@/app/_lib/types";

interface GenreExplorerProps {
    selectedGenre: string | null;
    topMovies: MovieSummary[];
}

export default function GenreExplorer({ selectedGenre, topMovies }: GenreExplorerProps) {
    if (!selectedGenre) {
        return <p className="text-sm text-secondary">Select a genre from the chart to explore top titles.</p>;
    }

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-secondary">Genre Explorer</p>
            <p className="mt-2 text-lg font-medium text-primary">
                Selected: <span className="text-[#38FDCF]">{selectedGenre}</span>
            </p>

            <div className="mt-4 space-y-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-secondary">Top Director</p>
                    <p className="mt-1 text-sm text-primary">—</p>
                    <p className="mt-1 text-xs text-tertiary">Available when the backend exposes director data per genre.</p>
                </div>

                <div>
                    <p className="text-xs uppercase tracking-wide text-secondary">Top Movies</p>
                    {topMovies.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                            {topMovies.map((movie) => (
                                <li key={movie.tmdbId} className="flex items-center gap-2 text-sm text-primary">
                                    <span className="text-secondary">•</span>
                                    {movie.title}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 text-sm text-secondary">No movies found for this genre in the current dashboard data.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
