"use client";

import { useMemo, useState } from "react";
import { getGenreColor } from "@/app/_lib/dashboard-utils";
import { ChevLeft, ChevRight } from "@/app/_components/global/icons";
import type { GenreStat } from "@/app/_lib/types";

interface GenreDonutChartProps {
    genreStats: GenreStat[];
    selectedGenre: string | null;
    onSelectGenre: (genreName: string) => void;
}

interface Slice {
    genreName: string;
    count: number;
    percentage: number;
    startAngle: number;
    endAngle: number;
    color: string;
}

const SIZE = 200;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2 - 4;
const CENTER = SIZE / 2;
const GAP = 4;
const PAGE_SIZE = 5;

function polarToCartesian(angle: number): { x: number; y: number } {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
        x: CENTER + RADIUS * Math.cos(radians),
        y: CENTER + RADIUS * Math.sin(radians),
    };
}

function buildSlices(genreStats: GenreStat[]): Slice[] {
    const totalCount = genreStats.reduce((sum, stat) => sum + stat.count, 0) || 1;
    const gap = genreStats.length > 1 ? GAP : 0;
    let currentAngle = 0;

    return genreStats.map((stat, index) => {
        const sweep = (stat.count / totalCount) * 360;
        const drawnStart = currentAngle + gap / 2;
        const drawnEnd = currentAngle + sweep - gap / 2;
        const slice: Slice = {
            ...stat,
            startAngle: drawnStart,
            endAngle: drawnEnd > drawnStart ? drawnEnd : drawnStart + 0.5,
            color: getGenreColor(index),
        };
        currentAngle += sweep;
        return slice;
    });
}

function describeArc(startAngle: number, endAngle: number): string {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function GenreDonutChart({ genreStats, selectedGenre, onSelectGenre }: GenreDonutChartProps) {
    const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const slices = useMemo(() => buildSlices(genreStats), [genreStats]);
    const maxPercentage = useMemo(() => Math.max(...genreStats.map((stat) => stat.percentage), 1), [genreStats]);

    if (genreStats.length === 0) {
        return <p className="text-sm text-secondary">Genre data will appear once movies include genre information.</p>;
    }

    const activeGenre = hoveredGenre ?? selectedGenre;
    const activeStat = genreStats.find((stat) => stat.genreName === activeGenre) ?? null;

    const totalPages = Math.ceil(slices.length / PAGE_SIZE);
    const safePage = Math.min(page, totalPages - 1);
    const visibleSlices = slices.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

    return (
        <div className="flex flex-col items-center gap-5">
            <div className="relative shrink-0">
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Genre distribution chart">
                    <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE} />
                    {slices.map((slice) => {
                        const isActive = activeGenre === slice.genreName;
                        const isHovered = hoveredGenre === slice.genreName;
                        return (
                            <path
                                key={slice.genreName}
                                d={describeArc(slice.startAngle, slice.endAngle)}
                                fill="none"
                                stroke={slice.color}
                                strokeWidth={STROKE}
                                strokeLinecap="butt"
                                className="cursor-pointer transition-all duration-300 ease-out"
                                style={{
                                    opacity: isActive ? 1 : 0.1,
                                    filter: isHovered ? `drop-shadow(0 0 7px ${slice.color})` : undefined,
                                }}
                                onMouseEnter={() => setHoveredGenre(slice.genreName)}
                                onMouseLeave={() => setHoveredGenre(null)}
                                onClick={() => onSelectGenre(slice.genreName)}
                            />
                        );
                    })}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    {activeStat ? (
                        <>
                            <p className="mt-2 text-4xl font-semibold leading-none text-primary">{activeStat.percentage}%</p>
                            <p className="max-w-[7rem] text-sm font-medium text-primary">{activeStat.genreName}</p>
                        </>
                    ) : (
                        <>
                            <p className="text-3xl font-semibold leading-none text-primary">{genreStats.length}</p>
                            <p className="mt-1 text-xs uppercase tracking-wide text-secondary">genres</p>
                        </>
                    )}
                </div>
            </div>

            <div className="w-full">
                <ul className="grid w-full gap-2.5">
                    {visibleSlices.map((slice) => {
                        const isActive = activeGenre === slice.genreName;
                        return (
                            <li key={slice.genreName}>
                                <button
                                    type="button"
                                    onClick={() => onSelectGenre(slice.genreName)}
                                    onMouseEnter={() => setHoveredGenre(slice.genreName)}
                                    onMouseLeave={() => setHoveredGenre(null)}
                                    className="group flex w-full flex-col gap-1.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="flex items-center gap-2 text-sm text-primary">
                                            <span className="h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: slice.color }} />
                                            <span className={isActive ? "font-medium" : ""}>{slice.genreName}</span>
                                        </span>
                                        <span className={`text-xs tabular-nums ${isActive ? "text-primary" : "text-secondary"}`}>{slice.percentage}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                            style={{
                                                width: `${(slice.percentage / maxPercentage) * 100}%`,
                                                backgroundColor: slice.color,
                                                opacity: activeGenre != null && !isActive ? 0.4 : 1,
                                            }}
                                        />
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {totalPages > 1 && (
                    <div className="mt-3 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                            disabled={safePage === 0}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-secondary transition-colors hover:bg-white/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                            aria-label="Previous genres"
                        >
                            <ChevLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button key={index} type="button" onClick={() => setPage(index)} aria-label={`Genre page ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === safePage ? "w-5 bg-accent" : "w-1.5 bg-white/20 hover:bg-white/40"}`} />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                            disabled={safePage === totalPages - 1}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-secondary transition-colors hover:bg-white/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                            aria-label="More genres"
                        >
                            <ChevRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
