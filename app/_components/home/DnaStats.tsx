interface DnaStatsProps {
    moviesSaved: number;
    peopleSaved: number;
    avgRating: number | null;
    topRating: number | null;
    latestYear: number | null;
}

interface Stat {
    label: string;
    value: string;
    accent?: boolean;
}

export default function DnaStats({ moviesSaved, peopleSaved, avgRating, topRating, latestYear }: DnaStatsProps) {
    const stats: Stat[] = [
        { label: "Movies saved", value: moviesSaved.toLocaleString() },
        { label: "People saved", value: peopleSaved.toLocaleString() },
        { label: "Avg rating", value: avgRating != null ? `★ ${avgRating.toFixed(1)}` : "—", accent: true },
        { label: "Top rated", value: topRating != null ? `★ ${topRating.toFixed(1)}` : "—", accent: true },
        { label: "Latest release", value: latestYear != null ? `${latestYear}` : "—" },
    ];

    return (
        <div className="grid grid-cols-3 gap-y-5 sm:grid-cols-5">
            {stats.map((stat, index) => (
                <div key={stat.label} className={`flex flex-col items-center px-2 text-center ${index < stats.length - 1 ? "border-r border-white/5" : ""}`}>
                    <p className={`text-xl font-semibold leading-none ${stat.accent ? "text-[#38FDCF]" : "text-primary"}`}>{stat.value}</p>
                    <p className="mt-1.5 text-xs text-secondary">{stat.label}</p>
                </div>
            ))}
        </div>
    );
}
