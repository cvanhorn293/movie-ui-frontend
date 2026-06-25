export type AuthProvider = "GOOGLE" | "GITHUB";

export interface User {
    id: number;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    provider: AuthProvider;
    createdAt: string;
}

export type FavoriteEntityType = "MOVIE" | "PERSON";

export interface MovieSummary {
    tmdbId: number;
    title: string;
    overview: string | null;
    posterUrl: string | null;
    backdropUrl?: string | null;
    rating: number | null;
    releaseDate: string | null;
    genreIds: number[];
    genreNames: string[];
}

export interface Favorite {
    id: number;
    entityType: FavoriteEntityType;
    entityId: number;
    title: string;
    imageUrl: string | null;
    createdAt: string;
}

export interface DashboardData {
    movieCount: number;
    personCount: number;
    favoriteCount: number;
    trendingMovies: MovieSummary[];
    featuredMovies: MovieSummary[];
    recommendedMovies: MovieSummary[];
    recentFavorites: Favorite[];
}

export interface GenreStat {
    genreName: string;
    count: number;
    percentage: number;
}

export interface CollectionInsights {
    favoriteGenre: string | null;
    favoriteDirector: string | null;
    favoriteDecade: string | null;
    collectionAgeDays: number | null;
    recentFavorite: Favorite | null;
}
