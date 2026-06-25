"use client";

import { useMemo, useState } from "react";
import { getGenreColor } from "@/app/_lib/dashboard-utils";
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

const SIZE = 220;
const STROKE = 36;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;

function polarToCartesian(angle: number): { x: number; y: number } {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
        x: CENTER + RADIUS * Math.cos(radians),
        y: CENTER + RADIUS * Math.sin(radians),
    };
}

function buildSlices(genreStats: GenreStat[]): Slice[] {
    let currentAngle = 0;

    return genreStats.map((stat, index) => {
        const sweep = (stat.percentage / 100) * 360;
        const slice: Slice = {
            ...stat,
            startAngle: currentAngle,
            endAngle: currentAngle + sweep,
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
    const slices = useMemo(() => buildSlices(genreStats), [genreStats]);

    if (genreStats.length === 0) {
        return <p className="text-sm text-secondary">Genre data will appear once movies include genre information.</p>;
    }

    const activeGenre = hoveredGenre ?? selectedGenre;

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative mx-auto shrink-0">
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Genre distribution chart">
                    <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} />
                    {slices.map((slice) => {
                        const isActive = activeGenre === slice.genreName;
                        return (
                            <path
                                key={slice.genreName}
                                d={describeArc(slice.startAngle, slice.endAngle)}
                                fill="none"
                                stroke={slice.color}
                                strokeWidth={isActive ? STROKE + 6 : STROKE}
                                strokeLinecap="butt"
                                className="cursor-pointer transition-all duration-200"
                                onMouseEnter={() => setHoveredGenre(slice.genreName)}
                                onMouseLeave={() => setHoveredGenre(null)}
                                onClick={() => onSelectGenre(slice.genreName)}
                            />
                        );
                    })}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wide text-secondary">Genres</p>
                    <p className="text-xl font-semibold text-primary">{activeGenre ?? "Explore"}</p>
                    {activeGenre && (
                        <p className="text-sm text-secondary">
                            {genreStats.find((stat) => stat.genreName === activeGenre)?.percentage}%
                        </p>
                    )}
                </div>
            </div>

            <ul className="grid flex-1 gap-2 sm:grid-cols-2">
                {slices.map((slice) => {
                    const isActive = activeGenre === slice.genreName;
                    return (
                        <li key={slice.genreName}>
                            <button
                                type="button"
                                onClick={() => onSelectGenre(slice.genreName)}
                                onMouseEnter={() => setHoveredGenre(slice.genreName)}
                                onMouseLeave={() => setHoveredGenre(null)}
                                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                                    isActive ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                                }`}
                            >
                                <span className="flex items-center gap-2 text-sm text-primary">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                                    {slice.genreName}
                                </span>
                                <span className="text-xs text-secondary">{slice.percentage}%</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
