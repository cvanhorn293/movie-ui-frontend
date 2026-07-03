"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPerson } from "@/app/_lib/api";
import type { PersonSummary } from "@/app/_lib/types";
import { useFavorites } from "@/app/_hooks/useFavorites";
import { Favorited, Favorites } from "@/app/_components/global/icons";

interface PersonPanelProps {
    person: PersonSummary | null;
    onClose: () => void;
}

const BIO_PREVIEW_LENGTH = 320;

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

function getAge(birthday: string | null | undefined, deathday: string | null | undefined): number | null {
    if (!birthday) return null;
    const born = new Date(birthday);
    if (Number.isNaN(born.getTime())) return null;
    const end = deathday ? new Date(deathday) : new Date();
    if (Number.isNaN(end.getTime())) return null;
    let age = end.getFullYear() - born.getFullYear();
    const monthDiff = end.getMonth() - born.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < born.getDate())) {
        age -= 1;
    }
    return age;
}

function formatDate(value: string | null | undefined): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatGender(gender: string | number | null | undefined): string | null {
    if (gender == null) return null;
    if (typeof gender === "string") return gender.trim() || null;
    const map: Record<number, string> = { 1: "Female", 2: "Male", 3: "Non-binary" };
    return map[gender] ?? null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4">
            <span className="w-32 shrink-0 text-xs uppercase tracking-wide text-tertiary">{label}</span>
            <span className="text-sm text-primary">{value}</span>
        </div>
    );
}

export default function PersonPanel({ person, onClose }: PersonPanelProps) {
    const [displayed, setDisplayed] = useState<PersonSummary | null>(null);
    const [bioExpanded, setBioExpanded] = useState(false);
    const { isPersonFavorited, togglePersonFavorite, isAuthenticated } = useFavorites();

    const open = person != null;

    useEffect(() => {
        if (person) {
            setDisplayed(person);
            setBioExpanded(false);
        }
    }, [person]);

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        if (open) {
            document.addEventListener("keydown", handleKey);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    const personId = displayed?.tmdbId ?? null;

    const { data: detail, isLoading } = useQuery({
        queryKey: ["person", personId],
        queryFn: () => fetchPerson(personId as number),
        enabled: open && personId != null,
        staleTime: 5 * 60 * 1000,
    });

    const name = detail?.name ?? displayed?.name ?? "";
    const profileUrl = detail?.profileUrl ?? displayed?.profileUrl ?? null;
    const department = detail?.knownForDepartment ?? displayed?.knownForDepartment ?? null;
    const favorited = personId != null && isPersonFavorited(personId);
    const knownFor = detail?.knownFor ?? [];

    const age = getAge(detail?.birthday, detail?.deathday);
    const born = formatDate(detail?.birthday);
    const died = formatDate(detail?.deathday);
    const gender = formatGender(detail?.gender);
    const alsoKnownAs = detail?.alsoKnownAs?.filter(Boolean).slice(0, 2).join(", ") || null;

    const bio = detail?.biography ?? "";
    const isBioLong = bio.length > BIO_PREVIEW_LENGTH;
    const shownBio = bioExpanded || !isBioLong ? bio : `${bio.slice(0, BIO_PREVIEW_LENGTH).trimEnd()}…`;

    const hasDetails = Boolean(born || died || gender || detail?.placeOfBirth || alsoKnownAs);

    return (
        <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
            <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label={name ? `${name} details` : "Person details"}
                className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/10 bg-card-nav-bg shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close panel"
                    className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-secondary backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-primary"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex gap-4 p-6 pb-4">
                    <div className="h-36 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                        {profileUrl ? (
                            <img src={profileUrl} alt={name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/15 to-teal-500/10 text-2xl font-semibold text-primary/70">{name ? getInitials(name) : "?"}</div>
                        )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                        <h2 className="text-2xl font-semibold leading-tight text-primary">{name}</h2>
                        {department && <p className="mt-1 text-sm text-secondary">{department}</p>}
                        {age != null && <p className="mt-1 text-xs text-tertiary">{detail?.deathday ? `Aged ${age}` : `${age} years old`}</p>}

                        {isAuthenticated && displayed && (
                            <button
                                type="button"
                                onClick={() => togglePersonFavorite(displayed)}
                                aria-pressed={favorited}
                                className="btn-secondary mt-auto inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-primary"
                            >
                                {favorited ? <Favorited className="h-4 w-4 text-[#38FDCF]" /> : <Favorites className="h-4 w-4" />}
                                {favorited ? "Favorited" : "Add to favorites"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6 px-6 pb-8">
                    {(hasDetails || isLoading) && (
                        <section>
                            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-tertiary">Details</h3>
                            {isLoading ? (
                                <div className="space-y-2 pt-2">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="h-3 animate-pulse rounded bg-white/5" />
                                    ))}
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {gender && <DetailRow label="Gender" value={gender} />}
                                    {born && <DetailRow label="Born" value={born} />}
                                    {detail?.placeOfBirth && <DetailRow label="Place of birth" value={detail.placeOfBirth} />}
                                    {died && <DetailRow label="Died" value={died} />}
                                    {alsoKnownAs && <DetailRow label="Also known as" value={alsoKnownAs} />}
                                </div>
                            )}
                        </section>
                    )}

                    <section>
                        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-tertiary">Biography</h3>
                        {isLoading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-3 animate-pulse rounded bg-white/5" />
                                ))}
                            </div>
                        ) : bio ? (
                            <div>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-secondary">{shownBio}</p>
                                {isBioLong && (
                                    <button type="button" onClick={() => setBioExpanded((prev) => !prev)} className="mt-2 text-sm font-medium text-[#38FDCF] transition-opacity hover:opacity-80">
                                        {bioExpanded ? "Show less" : "Read more"}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-secondary">No biography available.</p>
                        )}
                    </section>

                    <section>
                        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-tertiary">Known for</h3>
                        {isLoading ? (
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />
                                ))}
                            </div>
                        ) : knownFor.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {knownFor.slice(0, 9).map((credit) => (
                                    <div key={`${credit.tmdbId}-${credit.character ?? credit.job ?? ""}`} className="flex flex-col">
                                        <div className="aspect-[2/3] overflow-hidden rounded-lg border border-white/5 bg-white/5">
                                            {credit.posterUrl ? (
                                                <img src={credit.posterUrl} alt={credit.title} loading="lazy" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-tertiary">{credit.title}</div>
                                            )}
                                        </div>
                                        <p className="mt-1.5 line-clamp-2 text-xs font-medium text-primary">{credit.title}</p>
                                        {(credit.character || credit.job) && <p className="line-clamp-1 text-[11px] text-tertiary">{credit.character || credit.job}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-secondary">Known-for titles aren&apos;t available yet.</p>
                        )}
                    </section>
                </div>
            </aside>
        </div>
    );
}
