import SectionCard from "./SectionCard";

interface CollectionSnapshotProps {
    movieCount: number;
    personCount: number;
    favoriteCount: number;
    isLoading?: boolean;
}

interface SnapshotStatProps {
    label: string;
    value: number;
}

function SnapshotStat({ label, value }: SnapshotStatProps) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-secondary">{label}</p>
            <p className="mt-1 text-lg font-semibold text-primary sm:text-xl">{value.toLocaleString()}</p>
        </div>
    );
}

export default function CollectionSnapshot({ movieCount, personCount, favoriteCount, isLoading }: CollectionSnapshotProps) {
    return (
        <SectionCard title="Collection Snapshot" className="h-full">
            {isLoading ? (
                <div className="grid gap-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-16 animate-pulse rounded-lg bg-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-3">
                    <SnapshotStat label="Movies in Library" value={movieCount} />
                    <SnapshotStat label="People in Library" value={personCount} />
                    <SnapshotStat label="Total Favorites" value={favoriteCount} />
                </div>
            )}
        </SectionCard>
    );
}
