import { describe, expect, it } from "vitest";
import {
    buildGenreStats,
    getAllMovies,
    getAverageRating,
    getDistinctRecommendedMovies,
    getFavoriteDecade,
    getMoviesForGenre,
} from "./dashboard-utils";
import type { DashboardData, MovieSummary } from "./types";

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

function dashboard(overrides: Partial<DashboardData> = {}): DashboardData {
    return {
        movieCount: 0,
        personCount: 0,
        favoriteCount: 0,
        trendingMovies: [],
        featuredMovies: [],
        recommendedMovies: [],
        recentFavorites: [],
        ...overrides,
    };
}

describe("getAllMovies", () => {
    it("merges lists without duplicates", () => {
        const shared = movie({ tmdbId: 1, title: "Shared" });
        const data = dashboard({
            featuredMovies: [shared],
            trendingMovies: [shared, movie({ tmdbId: 2, title: "Trend" })],
            recommendedMovies: [movie({ tmdbId: 3, title: "Rec" })],
        });

        expect(getAllMovies(data).map((entry) => entry.tmdbId)).toEqual([1, 2, 3]);
    });
});

describe("getDistinctRecommendedMovies", () => {
    it("hides recommendations already in trending or featured", () => {
        const data = dashboard({
            trendingMovies: [movie({ tmdbId: 1, title: "Trend" })],
            featuredMovies: [movie({ tmdbId: 2, title: "Featured" })],
            recommendedMovies: [
                movie({ tmdbId: 1, title: "Trend again" }),
                movie({ tmdbId: 3, title: "Fresh" }),
            ],
        });

        expect(getDistinctRecommendedMovies(data).map((entry) => entry.tmdbId)).toEqual([3]);
    });
});

describe("buildGenreStats", () => {
    it("counts genres and computes percentages", () => {
        const stats = buildGenreStats([
            movie({ tmdbId: 1, title: "A", genreNames: ["Action", "Drama"] }),
            movie({ tmdbId: 2, title: "B", genreNames: ["Action"] }),
        ]);

        expect(stats[0]).toMatchObject({ genreName: "Action", count: 2, percentage: 67 });
        expect(stats[1]).toMatchObject({ genreName: "Drama", count: 1, percentage: 33 });
    });
});

describe("getAverageRating", () => {
    it("averages known ratings to one decimal", () => {
        expect(
            getAverageRating([
                movie({ tmdbId: 1, title: "A", rating: 8 }),
                movie({ tmdbId: 2, title: "B", rating: 7 }),
                movie({ tmdbId: 3, title: "C", rating: null }),
            ]),
        ).toBe(7.5);
    });
});

describe("getMoviesForGenre", () => {
    it("returns top-rated movies for a genre", () => {
        const movies = [
            movie({ tmdbId: 1, title: "Low", genreNames: ["Action"], rating: 5 }),
            movie({ tmdbId: 2, title: "High", genreNames: ["Action"], rating: 9 }),
            movie({ tmdbId: 3, title: "Other", genreNames: ["Drama"], rating: 10 }),
        ];

        expect(getMoviesForGenre(movies, "Action").map((entry) => entry.tmdbId)).toEqual([2, 1]);
    });
});

describe("getFavoriteDecade", () => {
    it("returns the most common decade", () => {
        expect(
            getFavoriteDecade([
                movie({ tmdbId: 1, title: "A", releaseDate: "1999-01-01" }),
                movie({ tmdbId: 2, title: "B", releaseDate: "1995-01-01" }),
                movie({ tmdbId: 3, title: "C", releaseDate: "2010-01-01" }),
            ]),
        ).toBe("1990s");
    });
});
