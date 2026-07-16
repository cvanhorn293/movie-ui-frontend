export interface DnaStatItem {
    label: string;
    value: string;
    accent?: boolean;
}

interface DnaStatsProps {
    moviesSaved?: number;
    peopleSaved?: number;
    avgRating?: number | null;
    topRating?: number | null;
    latestYear?: number | null;
    stats?: DnaStatItem[];
}

export default function DnaStats({ moviesSaved = 0, peopleSaved = 0, avgRating = null, topRating = null, latestYear = null, stats }: DnaStatsProps) {
    const resolvedStats: DnaStatItem[] =
        stats ??
        [
            { label: "Movies saved", value: moviesSaved.toLocaleString() },
            { label: "People saved", value: peopleSaved.toLocaleString() },
            { label: "Avg rating", value: avgRating != null ? `★ ${avgRating.toFixed(1)}` : "—", accent: true },
            { label: "Top rated", value: topRating != null ? `★ ${topRating.toFixed(1)}` : "—", accent: true },
            { label: "Latest release", value: latestYear != null ? `${latestYear}` : "—" },
        ];

    const columnsClass =
        resolvedStats.length <= 4 ? "grid-cols-2 sm:grid-cols-4" : resolvedStats.length === 5 ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-3 sm:grid-cols-6";

    return (
        <div className={`grid gap-y-5 ${columnsClass}`}>
            {resolvedStats.map((stat, index) => (
                <div key={stat.label} className={`flex flex-col items-center px-2 text-center ${index < resolvedStats.length - 1 ? "border-r border-white/5" : ""}`}>
                    <p className={`text-xl font-semibold leading-none ${stat.accent ? "text-accent" : "text-primary"}`}>{stat.value}</p>
                    <p className="mt-1.5 text-xs text-secondary">{stat.label}</p>
                </div>
            ))}
        </div>
    );
}
