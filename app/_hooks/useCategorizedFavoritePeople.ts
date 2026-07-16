"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchPerson } from "@/app/_lib/api";
import type { Favorite, PersonSummary } from "@/app/_lib/types";
import { favoriteToPersonSummary, getPersonRole, type PersonRole } from "@/app/_lib/personUtils";

function categorizeFavorite(favorite: Favorite, legacyRoleMap: Map<number, PersonRole>): PersonRole | null {
    if (favorite.entityType === "ACTOR") {
        return "actor";
    }
    if (favorite.entityType === "DIRECTOR") {
        return "director";
    }
    // Legacy PERSON favorites need a fetched department to decide actor vs director.
    return legacyRoleMap.get(favorite.entityId) ?? null;
}

export function useCategorizedFavoritePeople(favorites: Favorite[]) {
    const legacyFavorites = useMemo(() => favorites.filter((favorite) => favorite.entityType === "PERSON"), [favorites]);

    const legacyQueries = useQueries({
        queries: legacyFavorites.map((favorite) => ({
            queryKey: ["person", favorite.entityId],
            queryFn: () => fetchPerson(favorite.entityId),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const legacyRoleMap = useMemo(() => {
        const map = new Map<number, PersonRole>();
        legacyFavorites.forEach((favorite, index) => {
            const detail = legacyQueries[index]?.data;
            map.set(favorite.entityId, getPersonRole(detail?.knownForDepartment) ?? "actor");
        });
        return map;
    }, [legacyFavorites, legacyQueries]);

    return useMemo(() => {
        const favoriteActors: PersonSummary[] = [];
        const favoriteDirectors: PersonSummary[] = [];

        for (const favorite of favorites) {
            const role = categorizeFavorite(favorite, legacyRoleMap);
            const person = favoriteToPersonSummary(favorite);

            if (role === "director") {
                favoriteDirectors.push(person);
            } else if (role === "actor") {
                favoriteActors.push(person);
            }
        }

        return { favoriteActors, favoriteDirectors };
    }, [favorites, legacyRoleMap]);
}
