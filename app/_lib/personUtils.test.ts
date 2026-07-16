import { describe, expect, it } from "vitest";
import {
    favoriteToMovieSummary,
    favoriteToPersonSummary,
    getFavoriteEntityTypeForPerson,
    getPersonRole,
    isPersonFavoriteEntity,
} from "./personUtils";
import type { Favorite, PersonSummary } from "./types";

describe("isPersonFavoriteEntity", () => {
    it("recognizes actor, director, and legacy person types", () => {
        expect(isPersonFavoriteEntity("ACTOR")).toBe(true);
        expect(isPersonFavoriteEntity("DIRECTOR")).toBe(true);
        expect(isPersonFavoriteEntity("PERSON")).toBe(true);
        expect(isPersonFavoriteEntity("MOVIE")).toBe(false);
    });
});

describe("getPersonRole", () => {
    it("maps TMDB departments to roles", () => {
        expect(getPersonRole("Acting")).toBe("actor");
        expect(getPersonRole("Directing")).toBe("director");
        expect(getPersonRole("Writing")).toBeNull();
        expect(getPersonRole(null)).toBeNull();
    });
});

describe("getFavoriteEntityTypeForPerson", () => {
    it("defaults non-directors to ACTOR", () => {
        const director: PersonSummary = {
            tmdbId: 1,
            name: "Nolan",
            knownForDepartment: "Directing",
            profileUrl: null,
        };
        const actor: PersonSummary = {
            tmdbId: 2,
            name: "DiCaprio",
            knownForDepartment: "Acting",
            profileUrl: null,
        };

        expect(getFavoriteEntityTypeForPerson(director)).toBe("DIRECTOR");
        expect(getFavoriteEntityTypeForPerson(actor)).toBe("ACTOR");
    });
});

describe("favorite converters", () => {
    it("builds a person summary from an actor favorite", () => {
        const favorite: Favorite = {
            id: 1,
            entityType: "ACTOR",
            entityId: 42,
            title: "Keanu Reeves",
            imageUrl: "/keanu.jpg",
            createdAt: "2024-01-01T00:00:00Z",
        };

        expect(favoriteToPersonSummary(favorite)).toEqual({
            tmdbId: 42,
            name: "Keanu Reeves",
            knownForDepartment: "Acting",
            profileUrl: "/keanu.jpg",
        });
    });

    it("builds a movie summary from a movie favorite", () => {
        const favorite: Favorite = {
            id: 2,
            entityType: "MOVIE",
            entityId: 99,
            title: "The Matrix",
            imageUrl: "/matrix.jpg",
            createdAt: "2024-01-01T00:00:00Z",
        };

        expect(favoriteToMovieSummary(favorite)).toMatchObject({
            tmdbId: 99,
            title: "The Matrix",
            posterUrl: "/matrix.jpg",
            genreNames: [],
        });
    });
});
