import type { CollectionInsights, DashboardData, GenreStat, MovieSummary } from "./types";

const GENRE_COLORS = [
    "#38FDCF",
    "#36FAF9",
    "#5B8DEF",
    "#A78BFA",
    "#F472B6",
    "#FBBF24",
    "#34D399",
    "#FB7185",
    "#60A5FA",
    "#C084FC",
];

export function getGenreColor(index: number): string {
    return GENRE_COLORS[index % GENRE_COLORS.length];
}

export function getAllMovies(data: DashboardData): MovieSummary[] {
    const seen = new Set<number>();
    const movies: MovieSummary[] = [];

    for (const movie of [...data.featuredMovies, ...data.trendingMovies, ...data.recommendedMovies]) {
        if (!seen.has(movie.tmdbId)) {
            seen.add(movie.tmdbId);
            movies.push(movie);
        }
    }

    return movies;
}

export function buildGenreStats(movies: MovieSummary[]): GenreStat[] {
    const counts = new Map<string, number>();

    for (const movie of movies) {
        for (const genre of movie.genreNames ?? []) {
            counts.set(genre, (counts.get(genre) ?? 0) + 1);
        }
    }

    const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
    if (total === 0) {
        return [];
    }

    return Array.from(counts.entries())
        .map(([genreName, count]) => ({
            genreName,
            count,
            percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);
}

export function getAverageRating(movies: MovieSummary[]): number | null {
    const ratings = movies.map((movie) => movie.rating).filter((rating): rating is number => rating != null);
    if (ratings.length === 0) {
        return null;
    }
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return Math.round(average * 10) / 10;
}

export function getMoviesForGenre(movies: MovieSummary[], genreName: string): MovieSummary[] {
    return movies
        .filter((movie) => movie.genreNames?.includes(genreName))
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 6);
}

export function getFavoriteDecade(movies: MovieSummary[]): string | null {
    const decadeCounts = new Map<string, number>();

    for (const movie of movies) {
        if (!movie.releaseDate) {
            continue;
        }
        const year = Number.parseInt(movie.releaseDate.slice(0, 4), 10);
        if (Number.isNaN(year)) {
            continue;
        }
        const decade = `${Math.floor(year / 10) * 10}s`;
        decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + 1);
    }

    if (decadeCounts.size === 0) {
        return null;
    }

    return Array.from(decadeCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
}

export function buildCollectionInsights(data: DashboardData, genreStats: GenreStat[]): CollectionInsights {
    const movies = getAllMovies(data);
    const recentFavorite = data.recentFavorites[0] ?? null;

    const collectionAgeDays =
        data.recentFavorites.length > 0
            ? Math.max(
                  ...data.recentFavorites.map((favorite) => {
                      const created = new Date(favorite.createdAt).getTime();
                      const now = Date.now();
                      return Math.floor((now - created) / (1000 * 60 * 60 * 24));
                  }),
              )
            : null;

    return {
        favoriteGenre: genreStats[0]?.genreName ?? null,
        favoriteDirector: null,
        favoriteDecade: getFavoriteDecade(movies),
        collectionAgeDays,
        recentFavorite,
    };
}
