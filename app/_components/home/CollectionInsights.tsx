import type { CollectionInsights as CollectionInsightsData } from "@/app/_lib/types";
import type { FavoriteEntityType } from "@/app/_lib/types";
import SectionCard from "./SectionCard";

interface CollectionInsightsProps {
    insights: CollectionInsightsData;
    isLoading?: boolean;
}

function getFavoriteTypeLabel(entityType: FavoriteEntityType): string {
    switch (entityType) {
        case "MOVIE":
            return "Movie";
        case "ACTOR":
            return "Actor";
        case "DIRECTOR":
            return "Director";
        default:
            return "Person";
    }
}

interface InsightItemProps {
    label: string;
    value: string;
}

function InsightItem({ label, value }: InsightItemProps) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-secondary">{label}</p>
            <p className="mt-1 text-sm font-medium text-primary">{value}</p>
        </div>
    );
}

export default function CollectionInsights({ insights, isLoading }: CollectionInsightsProps) {
    const recentFavoriteLabel = insights.recentFavorite
        ? `${insights.recentFavorite.title} (${getFavoriteTypeLabel(insights.recentFavorite.entityType)})`
        : "—";

    return (
        <SectionCard title="Collection Insights">
            {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-16 animate-pulse rounded-lg bg-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <InsightItem label="Favorite Genre" value={insights.favoriteGenre ?? "—"} />
                    <InsightItem label="Favorite Director" value={insights.favoriteDirector ?? "—"} />
                    <InsightItem label="Favorite Decade" value={insights.favoriteDecade ?? "—"} />
                    <InsightItem
                        label="Collection Age"
                        value={insights.collectionAgeDays != null ? `${insights.collectionAgeDays} days` : "—"}
                    />
                    <InsightItem label="Recent Favorite" value={recentFavoriteLabel} />
                </div>
            )}
        </SectionCard>
    );
}
