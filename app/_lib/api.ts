import axios from "axios";
import type { CreateFavoriteRequest, DashboardData, Favorite, MovieBrowseResponse, MovieDetail, PeoplePage, PersonDetail, RecommendationsResponse, SearchResponse, User } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// Session cookies must travel with every request for OAuth-backed auth.
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export async function fetchDashboard(): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>("/api/dashboard");
    return response.data;
}

export async function fetchRecommendations(): Promise<RecommendationsResponse> {
    try {
        const response = await apiClient.get<RecommendationsResponse>("/api/recommendations");
        return response.data;
    } catch (error) {
        // Unauthenticated users get an empty list instead of a hard failure.
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return { basedOnGenres: [], movies: [] };
        }
        throw error;
    }
}

export async function fetchMovieBrowse(): Promise<MovieBrowseResponse> {
    const response = await apiClient.get<MovieBrowseResponse>("/api/movies/browse");
    return response.data;
}

export async function searchAll(query: string): Promise<SearchResponse> {
    const response = await apiClient.get<SearchResponse>("/api/search", { params: { query } });
    return response.data;
}

export async function fetchMovie(id: number): Promise<MovieDetail> {
    const response = await apiClient.get<MovieDetail>(`/api/movies/${id}`);
    return response.data;
}

export async function fetchPerson(id: number): Promise<PersonDetail> {
    const response = await apiClient.get<PersonDetail>(`/api/people/${id}`);
    return response.data;
}

export async function fetchPeople(department: string, page = 1): Promise<PeoplePage> {
    const response = await apiClient.get<PeoplePage>("/api/people", { params: { department, page } });
    return response.data;
}

export async function fetchFavorites(): Promise<Favorite[]> {
    const response = await apiClient.get<Favorite[]>("/api/favorites");
    return Array.isArray(response.data) ? response.data : [];
}

export async function addFavorite(request: CreateFavoriteRequest): Promise<Favorite> {
    const response = await apiClient.post<Favorite>("/api/favorites", request);
    return response.data;
}

export async function removeFavorite(request: CreateFavoriteRequest): Promise<void> {
    await apiClient.delete("/api/favorites", { data: request });
}

export async function fetchCurrentUser(): Promise<User | null> {
    try {
        const response = await apiClient.get("/api/me");
        return normalizeUser(response.data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return null;
        }
        throw error;
    }
}

/** Accepts camelCase or snake_case fields from the backend. */
function normalizeUser(data: unknown): User | null {
    if (!data || typeof data !== "object") {
        return null;
    }

    const raw = data as Record<string, unknown>;
    const id = raw.id;

    if (typeof id !== "number") {
        return null;
    }

    const email = pickString(raw, "email") ?? "";
    const displayName = pickString(raw, "displayName", "display_name") ?? email.split("@")[0] ?? "User";
    const avatarUrl = pickNullableString(raw, "avatarUrl", "avatar_url");
    const provider = pickProvider(raw.provider);
    const createdAt = pickString(raw, "createdAt", "created_at") ?? new Date().toISOString();

    return {
        id,
        email,
        displayName,
        avatarUrl,
        provider,
        createdAt,
    };
}

function pickString(raw: Record<string, unknown>, ...keys: string[]): string | null {
    for (const key of keys) {
        const value = raw[key];
        if (typeof value === "string" && value.trim().length > 0) {
            return value;
        }
    }

    return null;
}

function pickNullableString(raw: Record<string, unknown>, ...keys: string[]): string | null {
    for (const key of keys) {
        const value = raw[key];
        if (typeof value === "string" && value.trim().length > 0) {
            return value;
        }
    }

    return null;
}

function pickProvider(value: unknown): User["provider"] {
    if (value === "GOOGLE" || value === "GITHUB") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.toUpperCase();
        if (normalized === "GOOGLE" || normalized === "GITHUB") {
            return normalized;
        }
    }

    return "GOOGLE";
}

export type OAuthProvider = "google" | "github";

export function getOAuthLoginUrl(provider: OAuthProvider): string {
    return `${API_BASE_URL}/oauth2/authorization/${provider}`;
}

export async function logoutUser(): Promise<void> {
    await apiClient.post("/logout");
}
