export type AuthProvider = "GOOGLE" | "GITHUB";

export interface User {
    id: number;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    provider: AuthProvider;
    createdAt: string;
}

export type FavoriteEntityType = "MOVIE" | "PERSON" | "ACTOR" | "DIRECTOR";

export interface CreateFavoriteRequest {
    entityType: FavoriteEntityType;
    entityId: number;
}

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

export interface MovieCastMember {
    tmdbId: number;
    name: string;
    character: string | null;
    profileUrl: string | null;
}

export interface MovieCrewMember {
    tmdbId: number;
    name: string;
    job: string | null;
    department: string | null;
}

export interface MovieDetail extends MovieSummary {
    runtimeMinutes?: number | null;
    tagline?: string | null;
    status?: string | null;
    originalLanguage?: string | null;
    budget?: number | null;
    revenue?: number | null;
    productionCountries?: string[];
    cast?: MovieCastMember[];
    crew?: MovieCrewMember[];
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

export interface PersonSummary {
    tmdbId: number;
    name: string;
    knownForDepartment: string | null;
    profileUrl: string | null;
}

export interface PersonCredit {
    tmdbId: number;
    title: string;
    posterUrl: string | null;
    releaseDate: string | null;
    rating: number | null;
    character: string | null;
    job: string | null;
}

export interface PersonDetail {
    tmdbId: number;
    name: string;
    biography: string | null;
    knownForDepartment: string | null;
    profileUrl: string | null;
    birthday: string | null;
    deathday?: string | null;
    placeOfBirth?: string | null;
    gender?: string | number | null;
    alsoKnownAs?: string[];
    homepage?: string | null;
    knownFor?: PersonCredit[];
}

export interface PeoplePage {
    page: number;
    totalPages: number;
    results: PersonSummary[];
}

export interface SearchResponse {
    movies: MovieSummary[];
    people: PersonSummary[];
}
