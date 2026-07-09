import type { Favorite, FavoriteEntityType, PersonSummary } from "./types";

export type PersonRole = "actor" | "director";

const PERSON_FAVORITE_TYPES = new Set<FavoriteEntityType>(["ACTOR", "DIRECTOR", "PERSON"]);

export function isPersonFavoriteEntity(entityType: FavoriteEntityType): boolean {
    return PERSON_FAVORITE_TYPES.has(entityType);
}

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
