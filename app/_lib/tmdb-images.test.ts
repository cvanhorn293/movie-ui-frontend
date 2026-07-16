import { describe, expect, it } from "vitest";
import { buildTmdbImageUrl, getPosterUrl, getSpotlightBackgroundUrl } from "./tmdb-images";
import type { MovieSummary } from "./types";

const movie: MovieSummary = {
    tmdbId: 1,
    title: "Test",
    overview: null,
    posterUrl: "/poster.jpg",
    backdropUrl: "/backdrop.jpg",
    rating: null,
    releaseDate: null,
    genreIds: [],
    genreNames: [],
};

describe("buildTmdbImageUrl", () => {
    it("builds a URL from a path", () => {
        expect(buildTmdbImageUrl("/abc.jpg", "w500")).toBe("https://image.tmdb.org/t/p/w500/abc.jpg");
        expect(buildTmdbImageUrl("abc.jpg", "w780")).toBe("https://image.tmdb.org/t/p/w780/abc.jpg");
    });

    it("swaps the size segment on full TMDB URLs", () => {
        expect(buildTmdbImageUrl("https://image.tmdb.org/t/p/w185/abc.jpg", "w1280")).toBe(
            "https://image.tmdb.org/t/p/w1280/abc.jpg",
        );
    });

    it("returns null for empty values", () => {
        expect(buildTmdbImageUrl(null)).toBeNull();
        expect(buildTmdbImageUrl("")).toBeNull();
    });
});

describe("getSpotlightBackgroundUrl", () => {
    it("prefers backdrop over poster", () => {
        expect(getSpotlightBackgroundUrl(movie)).toBe("https://image.tmdb.org/t/p/w1280/backdrop.jpg");
        expect(getSpotlightBackgroundUrl({ ...movie, backdropUrl: null })).toBe(
            "https://image.tmdb.org/t/p/w1280/poster.jpg",
        );
    });
});

describe("getPosterUrl", () => {
    it("returns a w500 poster URL", () => {
        expect(getPosterUrl(movie)).toBe("https://image.tmdb.org/t/p/w500/poster.jpg");
    });
});
