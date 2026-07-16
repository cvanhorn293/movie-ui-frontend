"use client";

import { useMemo, useState } from "react";
import { buildGenreStats, getAllMovies, getAverageRating, getMoviesForGenre } from "@/app/_lib/dashboard-utils";
import type { DashboardData } from "@/app/_lib/types";
import DnaStats, { type DnaStatItem } from "./DnaStats";
import GenreDonutChart from "./GenreDonutChart";
import GenreExplorer from "./GenreExplorer";
import SectionCard from "./SectionCard";

interface MovieDnaSectionProps {
    data: DashboardData | undefined;
    isLoading?: boolean;
    /** Render without the card background/border. */
    plain?: boolean;
    /** Replace the default DNA stats row. */
    stats?: DnaStatItem[];
    title?: string;
}

export default function MovieDnaSection({ data, isLoading, plain = false, stats, title = "Your Movie DNA" }: MovieDnaSectionProps) {
    const movies = useMemo(() => (data ? getAllMovies(data) : []), [data]);
    const genreStats = useMemo(() => buildGenreStats(movies), [movies]);
    const avgRating = useMemo(() => getAverageRating(movies), [movies]);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

    // Default to the top genre until the user picks a donut slice.
    const activeGenre = selectedGenre ?? genreStats[0]?.genreName ?? null;
    const topMovies = useMemo(() => (activeGenre ? getMoviesForGenre(movies, activeGenre) : []), [movies, activeGenre]);

    const activeIndex = genreStats.findIndex((stat) => stat.genreName === activeGenre);
    const activeStat = activeIndex >= 0 ? genreStats[activeIndex] : null;
    const genreMovies = useMemo(() => (activeGenre ? movies.filter((movie) => movie.genreNames?.includes(activeGenre)) : []), [movies, activeGenre]);
    const genreAvgRating = useMemo(() => getAverageRating(genreMovies), [genreMovies]);

    const topRating = useMemo(() => {
        const ratings = movies.map((movie) => movie.rating).filter((rating): rating is number => rating != null);
        return ratings.length > 0 ? Math.max(...ratings) : null;
    }, [movies]);

    const latestYear = useMemo(() => {
        const years = movies.map((movie) => (movie.releaseDate ? Number.parseInt(movie.releaseDate.slice(0, 4), 10) : Number.NaN)).filter((year) => !Number.isNaN(year));
        return years.length > 0 ? Math.max(...years) : null;
    }, [movies]);

    const body = isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-white/5" />
    ) : (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Genre donut — click a slice to update the spotlight */}
            <div className={plain ? "py-2" : "p-5"}>
                <GenreDonutChart genreStats={genreStats} selectedGenre={activeGenre} onSelectGenre={setSelectedGenre} />
            </div>

            <div className="flex flex-col gap-5">
                {/* Selected genre story + top titles */}
                <GenreExplorer
                    selectedGenre={activeGenre}
                    topMovies={topMovies}
                    percentage={activeStat?.percentage ?? null}
                    rank={activeIndex >= 0 ? activeIndex + 1 : null}
                    titleCount={genreMovies.length}
                    avgRating={genreAvgRating}
                    className="flex-1"
                />
                {/* Collection summary stats */}
                <div className={plain ? "px-1 py-2" : "rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4"}>
                    {stats ? (
                        <DnaStats stats={stats} />
                    ) : (
                        <DnaStats moviesSaved={data?.movieCount ?? 0} peopleSaved={data?.personCount ?? 0} avgRating={avgRating} topRating={topRating} latestYear={latestYear} />
                    )}
                </div>
            </div>
        </div>
    );

    if (plain) {
        return (
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-primary border-l-4 border-l-accent bg-white/5 py-2 pl-4 roboto-flex">{title}</h2>
                {body}
            </section>
        );
    }

    return <SectionCard title={title}>{body}</SectionCard>;
}
