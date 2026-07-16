import type { Favorite, FavoriteEntityType, MovieSummary, PersonSummary } from "./types";

export type PersonRole = "actor" | "director";

// PERSON is a legacy favorite type; ACTOR/DIRECTOR are the current ones.
const PERSON_FAVORITE_TYPES = new Set<FavoriteEntityType>(["ACTOR", "DIRECTOR", "PERSON"]);

export function isPersonFavoriteEntity(entityType: FavoriteEntityType): boolean {
    return PERSON_FAVORITE_TYPES.has(entityType);
}

/** Maps TMDB department strings to our actor/director roles. */
export function getPersonRole(department: string | null | undefined): PersonRole | null {
    if (!department) {
        return null;
    }
    const normalized = department.toLowerCase();
    if (normalized === "directing") {
        return "director";
    }
    if (normalized === "acting") {
        return "actor";
    }
    return null;
}

export function getPersonRoleLabel(role: PersonRole): string {
    return role === "actor" ? "Actor" : "Director";
}

export function getRoleLabelFromDepartment(department: string | null | undefined): string | null {
    const role = getPersonRole(department);
    return role ? getPersonRoleLabel(role) : null;
}

export function getFavoriteEntityTypeForPerson(person: PersonSummary): "ACTOR" | "DIRECTOR" {
    return getPersonRole(person.knownForDepartment) === "director" ? "DIRECTOR" : "ACTOR";
}

/** Builds a PersonSummary from a favorite when full person detail is not loaded yet. */
export function favoriteToPersonSummary(favorite: Favorite): PersonSummary {
    const department =
        favorite.entityType === "ACTOR" ? "Acting" : favorite.entityType === "DIRECTOR" ? "Directing" : null;

    return {
        tmdbId: favorite.entityId,
        name: favorite.title,
        knownForDepartment: department,
        profileUrl: favorite.imageUrl,
    };
}

/** Builds a MovieSummary from a favorite when full movie detail is not loaded yet. */
export function favoriteToMovieSummary(favorite: Favorite): MovieSummary {
    return {
        tmdbId: favorite.entityId,
        title: favorite.title,
        overview: null,
        posterUrl: favorite.imageUrl,
        rating: null,
        releaseDate: null,
        genreIds: [],
        genreNames: [],
    };
}
