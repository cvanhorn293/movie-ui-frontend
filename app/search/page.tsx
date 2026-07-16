import { Suspense } from "react";
import SearchResults from "@/app/_components/search/SearchResults";

export default function SearchPage() {
    return (
        <Suspense fallback={<p className="text-sm text-secondary">Loading search…</p>}>
            <SearchResults />
        </Suspense>
    );
}
