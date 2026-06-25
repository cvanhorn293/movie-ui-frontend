interface DnaStatsProps {
    moviesSaved: number;
    peopleSaved: number;
    avgRating: number | null;
}

interface StatItemProps {
    label: string;
    value: string;
}

function StatItem({ label, value }: StatItemProps) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-center">
            <p className="text-2xl font-semibold text-primary">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-secondary">{label}</p>
        </div>
    );
}

export default function DnaStats({ moviesSaved, peopleSaved, avgRating }: DnaStatsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <StatItem label="Movies Saved" value={moviesSaved.toLocaleString()} />
            <StatItem label="People Saved" value={peopleSaved.toLocaleString()} />
            <StatItem label="Avg Rating (Movies)" value={avgRating != null ? avgRating.toFixed(1) : "—"} />
        </div>
    );
}
