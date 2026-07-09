import type { MovieSummary } from "./types";

export interface GenreMovieRow {
    genreName: string;
    movies: MovieSummary[];
}

export function groupMoviesByGenre(movies: MovieSummary[]): GenreMovieRow[] {
    const grouped = new Map<string, MovieSummary[]>();

    for (const movie of movies) {
        for (const genre of movie.genreNames ?? []) {
            const list = grouped.get(genre) ?? [];
            if (!list.some((entry) => entry.tmdbId === movie.tmdbId)) {
                list.push(movie);
                grouped.set(genre, list);
            }
        }
    }

    return [...grouped.entries()]
        .map(([genreName, genreMovies]) => ({
            genreName,
            movies: genreMovies.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
        }))
        .sort((a, b) => b.movies.length - a.movies.length);
}

export function getSimilarMovies(movies: MovieSummary[], current: MovieSummary, limit = 8): MovieSummary[] {
    const genres = new Set(current.genreNames ?? []);

    return movies
        .filter((movie) => movie.tmdbId !== current.tmdbId)
        .map((movie) => {
            const sharedGenres = (movie.genreNames ?? []).filter((genre) => genres.has(genre)).length;
            return { movie, score: sharedGenres * 10 + (movie.rating ?? 0) };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ movie }) => movie);
}
