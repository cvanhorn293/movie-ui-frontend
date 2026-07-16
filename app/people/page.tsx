import { Suspense } from "react";
import PeopleExplorer from "@/app/_components/people/PeopleExplorer";

export default function PeoplePage() {
    return (
        <Suspense fallback={<p className="text-sm text-secondary">Loading people…</p>}>
            <PeopleExplorer />
        </Suspense>
    );
}
