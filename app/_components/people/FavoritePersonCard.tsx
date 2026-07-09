"use client";

import type { PersonSummary } from "@/app/_lib/types";
import { getPersonRole, getPersonRoleLabel } from "@/app/_lib/personUtils";
import { useFavorites } from "@/app/_hooks/useFavorites";
import { Favorited, Favorites } from "@/app/_components/global/icons";

interface FavoritePersonCardProps {
    person: PersonSummary;
    onSelect: (person: PersonSummary) => void;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export default function FavoritePersonCard({ person, onSelect }: FavoritePersonCardProps) {
    const { isPersonFavorited, togglePersonFavorite, isAuthenticated } = useFavorites();
    const favorited = isPersonFavorited(person.tmdbId);
    const role = getPersonRole(person.knownForDepartment);

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
            className="group flex cursor-pointer items-center gap-4 rounded-xl border border-[#38FDCF]/15 bg-gradient-to-r from-[#38FDCF]/[0.07] to-white/[0.02] p-3 outline-none transition-colors hover:border-[#38FDCF]/30 hover:from-[#38FDCF]/10 focus-visible:ring-2 focus-visible:ring-[#38FDCF]/60"
        >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
                {person.profileUrl ? (
                    <img src={person.profileUrl} alt={person.name} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/15 to-teal-500/10 text-sm font-semibold text-primary/70">{getInitials(person.name)}</div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="line-clamp-1 text-sm font-semibold text-primary">{person.name}</h3>
                    {role && <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${role === "actor" ? "bg-cyan-500/15 text-cyan-300" : "bg-violet-500/15 text-violet-300"}`}>{getPersonRoleLabel(role)}</span>}
                </div>
            </div>

            {isAuthenticated && (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        togglePersonFavorite(person);
                    }}
                    aria-label={favorited ? `Remove ${person.name} from favorites` : `Add ${person.name} to favorites`}
                    aria-pressed={favorited}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 transition-all hover:scale-105 hover:border-[#38FDCF]/30 hover:bg-black/35"
                >
                    {favorited ? <Favorited className="h-4 w-4 text-[#38FDCF]" /> : <Favorites className="h-4 w-4 text-white/80" />}
                </button>
            )}
        </div>
    );
}
