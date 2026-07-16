import type { MovieSummary } from "./types";

export interface GenreMovieRow {
    genreName: string;
    movies: MovieSummary[];
}

export const BROWSE_GENRE_QUERIES = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Drama",
    "Family",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Science Fiction",
    "Thriller",
] as const;

export interface GroupMoviesByGenreOptions {
    /** When true, each movie appears in at most one genre row. */
    exclusive?: boolean;
    excludeTmdbIds?: ReadonlySet<number>;
    minMoviesPerGenre?: number;
}

export function mergeUniqueMovies(...lists: MovieSummary[][]): MovieSummary[] {
    const seen = new Set<number>();
    const movies: MovieSummary[] = [];

    for (const list of lists) {
        for (const movie of list) {
            if (!seen.has(movie.tmdbId)) {
                seen.add(movie.tmdbId);
                movies.push(movie);
            }
        }
    }

    return movies;
}

/** Prefer the currently smallest genre row so exclusive rows stay balanced. */
function pickExclusiveGenre(movie: MovieSummary, genreSizes: Map<string, number>, genrePopularity: Map<string, number>): string | null {
    const genres = movie.genreNames ?? [];
    if (genres.length === 0) {
        return null;
    }

    return genres.reduce<string>((best, genre) => {
        const bestSize = genreSizes.get(best) ?? 0;
        const genreSize = genreSizes.get(genre) ?? 0;

        if (genreSize !== bestSize) {
            return genreSize < bestSize ? genre : best;
        }

        const bestPopularity = genrePopularity.get(best) ?? 0;
        const genrePopularityCount = genrePopularity.get(genre) ?? 0;
        return genrePopularityCount < bestPopularity ? genre : best;
    }, genres[0]);
}

function groupMoviesByGenreShared(movies: MovieSummary[]): GenreMovieRow[] {
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

function groupMoviesByGenreExclusive(movies: MovieSummary[], minMoviesPerGenre: number): GenreMovieRow[] {
    const genrePopularity = new Map<string, number>();

    for (const movie of movies) {
        for (const genre of movie.genreNames ?? []) {
            genrePopularity.set(genre, (genrePopularity.get(genre) ?? 0) + 1);
        }
    }

    const grouped = new Map<string, MovieSummary[]>();
    const genreSizes = () => new Map([...grouped.entries()].map(([genreName, genreMovies]) => [genreName, genreMovies.length]));

    const sortedMovies = [...movies].sort((a, b) => {
        const genreCountDiff = (a.genreNames?.length ?? 0) - (b.genreNames?.length ?? 0);
        if (genreCountDiff !== 0) {
            return genreCountDiff;
        }

        return (b.rating ?? 0) - (a.rating ?? 0);
    });

    for (const movie of sortedMovies) {
        const genre = pickExclusiveGenre(movie, genreSizes(), genrePopularity);
        if (!genre) {
            continue;
        }

        const list = grouped.get(genre) ?? [];
        list.push(movie);
        grouped.set(genre, list);
    }

    return [...grouped.entries()]
        .filter(([, genreMovies]) => genreMovies.length >= minMoviesPerGenre)
        .map(([genreName, genreMovies]) => ({
            genreName,
            movies: genreMovies.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
        }))
        .sort((a, b) => b.movies.length - a.movies.length);
}

export function groupMoviesByGenre(movies: MovieSummary[], options: GroupMoviesByGenreOptions = {}): GenreMovieRow[] {
    const { exclusive = false, excludeTmdbIds, minMoviesPerGenre = 1 } = options;
    const pool = excludeTmdbIds ? movies.filter((movie) => !excludeTmdbIds.has(movie.tmdbId)) : movies;

    if (exclusive) {
        return groupMoviesByGenreExclusive(pool, minMoviesPerGenre);
    }

    return groupMoviesByGenreShared(pool).filter((row) => row.movies.length >= minMoviesPerGenre);
}

export function excludeMovies(movies: MovieSummary[], excludeTmdbIds: ReadonlySet<number>): MovieSummary[] {
    return movies.filter((movie) => !excludeTmdbIds.has(movie.tmdbId));
}

/** Rank by shared genres first, then rating, and return the top matches. */
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
