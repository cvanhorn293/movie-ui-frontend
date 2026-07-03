"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPerson } from "@/app/_lib/api";
import type { PersonSummary } from "@/app/_lib/types";
import { useFavorites } from "@/app/_hooks/useFavorites";
import { Favorited, Favorites } from "@/app/_components/global/icons";

interface PersonCardProps {
    person: PersonSummary;
    onSelect: (person: PersonSummary) => void;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export default function PersonCard({ person, onSelect }: PersonCardProps) {
    const { isPersonFavorited, togglePersonFavorite, isAuthenticated } = useFavorites();
    const [hovered, setHovered] = useState(false);
    const favorited = isPersonFavorited(person.tmdbId);

    // Fetch detail on hover — populates the hover facts and warms the cache the panel reuses.
    const { data: detail } = useQuery({
        queryKey: ["person", person.tmdbId],
        queryFn: () => fetchPerson(person.tmdbId),
        enabled: hovered,
        staleTime: 5 * 60 * 1000,
    });

    const bornYear = detail?.birthday?.slice(0, 4) ?? null;
    const placeOfBirth = detail?.placeOfBirth ?? null;
    const hasFacts = Boolean(bornYear || placeOfBirth);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(person)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(person);
                }
            }}
            onMouseEnter={() => setHovered(true)}
            onFocus={() => setHovered(true)}
            className="group flex cursor-pointer flex-col rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#38FDCF]/60"
        >
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-white/5">
                {person.profileUrl ? (
                    <img src={person.profileUrl} alt={person.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/15 to-teal-500/10 text-3xl font-semibold text-primary/70">{getInitials(person.name)}</div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#04121D] via-[#04121D]/70 to-transparent" />

                {isAuthenticated && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            togglePersonFavorite(person);
                        }}
                        aria-label={favorited ? `Remove ${person.name} from favorites` : `Add ${person.name} to favorites`}
                        aria-pressed={favorited}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/65"
                    >
                        {favorited ? <Favorited className="h-4 w-4 text-[#38FDCF]" /> : <Favorites className="h-4 w-4 text-white" />}
                    </button>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-primary">{person.name}</h3>
                    {person.knownForDepartment && <p className="mt-0.5 line-clamp-1 text-xs text-secondary">{person.knownForDepartment}</p>}

                    <div className={`grid overflow-hidden transition-all duration-300 ${hovered && hasFacts ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="min-h-0 space-y-0.5">
                            {bornYear && <p className="text-[11px] text-tertiary">Born {bornYear}</p>}
                            {placeOfBirth && <p className="line-clamp-1 text-[11px] text-tertiary">{placeOfBirth}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
