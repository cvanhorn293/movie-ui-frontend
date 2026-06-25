import type { MovieSummary } from "./types";

export type TmdbImageSize = "w500" | "w780" | "w1280" | "original";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function buildTmdbImageUrl(pathOrUrl: string | null | undefined, size: TmdbImageSize = "w500"): string | null {
    if (!pathOrUrl) {
        return null;
    }

    if (pathOrUrl.startsWith("http")) {
        return pathOrUrl.replace(/\/t\/p\/[^/]+/, `/t/p/${size}`);
    }

    const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    return `${TMDB_IMAGE_BASE}/${size}${normalizedPath}`;
}

export function getSpotlightBackgroundUrl(movie: MovieSummary): string | null {
    if (movie.backdropUrl) {
        return buildTmdbImageUrl(movie.backdropUrl, "w1280");
    }

    return buildTmdbImageUrl(movie.posterUrl, "w1280");
}

export function getPosterUrl(movie: MovieSummary): string | null {
    return buildTmdbImageUrl(movie.posterUrl, "w500");
}
