import { describe, expect, it } from "vitest";
import { excludeMovies, getSimilarMovies, groupMoviesByGenre, mergeUniqueMovies } from "./movie-utils";
import type { MovieSummary } from "./types";

function movie(overrides: Partial<MovieSummary> & Pick<MovieSummary, "tmdbId" | "title">): MovieSummary {
    return {
        overview: null,
        posterUrl: null,
        rating: null,
        releaseDate: null,
        genreIds: [],
        genreNames: [],
        ...overrides,
    };
}

describe("mergeUniqueMovies", () => {
    it("dedupes by tmdbId and keeps the first occurrence", () => {
        const a = movie({ tmdbId: 1, title: "A" });
        const b = movie({ tmdbId: 2, title: "B" });
        const duplicate = movie({ tmdbId: 1, title: "A again" });

        expect(mergeUniqueMovies([a, b], [duplicate])).toEqual([a, b]);
    });
});

describe("groupMoviesByGenre", () => {
    it("groups movies into shared genre rows", () => {
        const movies = [
            movie({ tmdbId: 1, title: "Action Hit", genreNames: ["Action"], rating: 8 }),
            movie({ tmdbId: 2, title: "Drama Hit", genreNames: ["Drama"], rating: 7 }),
            movie({ tmdbId: 3, title: "Both", genreNames: ["Action", "Drama"], rating: 9 }),
        ];

        const rows = groupMoviesByGenre(movies);
        const action = rows.find((row) => row.genreName === "Action");
        const drama = rows.find((row) => row.genreName === "Drama");

        expect(action?.movies.map((entry) => entry.tmdbId)).toEqual([3, 1]);
        expect(drama?.movies.map((entry) => entry.tmdbId)).toEqual([3, 2]);
    });

    it("assigns each movie to one genre when exclusive is true", () => {
        const movies = [
            movie({ tmdbId: 1, title: "Only Action", genreNames: ["Action"], rating: 8 }),
            movie({ tmdbId: 2, title: "Only Drama", genreNames: ["Drama"], rating: 7 }),
            movie({ tmdbId: 3, title: "Both", genreNames: ["Action", "Drama"], rating: 9 }),
        ];

        const rows = groupMoviesByGenre(movies, { exclusive: true });
        const allIds = rows.flatMap((row) => row.movies.map((entry) => entry.tmdbId));

        expect(allIds.sort()).toEqual([1, 2, 3]);
        expect(new Set(allIds).size).toBe(3);
    });
});

describe("excludeMovies", () => {
    it("filters out excluded ids", () => {
        const movies = [movie({ tmdbId: 1, title: "A" }), movie({ tmdbId: 2, title: "B" })];
        expect(excludeMovies(movies, new Set([1])).map((entry) => entry.tmdbId)).toEqual([2]);
    });
});

describe("getSimilarMovies", () => {
    it("ranks by shared genres then rating", () => {
        const current = movie({ tmdbId: 1, title: "Current", genreNames: ["Action", "Sci-Fi"], rating: 8 });
        const movies = [
            movie({ tmdbId: 2, title: "Same genres", genreNames: ["Action", "Sci-Fi"], rating: 7 }),
            movie({ tmdbId: 3, title: "One genre high rating", genreNames: ["Action"], rating: 9 }),
            movie({ tmdbId: 4, title: "Unrelated", genreNames: ["Comedy"], rating: 10 }),
        ];

        expect(getSimilarMovies(movies, current, 2).map((entry) => entry.tmdbId)).toEqual([2, 3]);
    });
});
