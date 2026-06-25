"use client";

import { useMemo, useState } from "react";
import { buildGenreStats, getAllMovies, getAverageRating, getMoviesForGenre } from "@/app/_lib/dashboard-utils";
import type { DashboardData } from "@/app/_lib/types";
import DnaStats from "./DnaStats";
import GenreDonutChart from "./GenreDonutChart";
import GenreExplorer from "./GenreExplorer";
import SectionCard from "./SectionCard";

interface MovieDnaSectionProps {
    data: DashboardData | undefined;
    isLoading?: boolean;
}

export default function MovieDnaSection({ data, isLoading }: MovieDnaSectionProps) {
    const movies = useMemo(() => (data ? getAllMovies(data) : []), [data]);
    const genreStats = useMemo(() => buildGenreStats(movies), [movies]);
    const avgRating = useMemo(() => getAverageRating(movies), [movies]);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

    const activeGenre = selectedGenre ?? genreStats[0]?.genreName ?? null;
    const topMovies = useMemo(() => (activeGenre ? getMoviesForGenre(movies, activeGenre) : []), [movies, activeGenre]);

    return (
        <SectionCard title="Your Movie DNA">
            {isLoading ? (
                <div className="h-64 animate-pulse rounded-lg bg-white/5" />
            ) : (
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr_1fr]">
                    <GenreDonutChart genreStats={genreStats} selectedGenre={activeGenre} onSelectGenre={setSelectedGenre} />
                    <DnaStats moviesSaved={data?.movieCount ?? 0} peopleSaved={data?.personCount ?? 0} avgRating={avgRating} />
                    <GenreExplorer selectedGenre={activeGenre} topMovies={topMovies} />
                </div>
            )}
        </SectionCard>
    );
}
