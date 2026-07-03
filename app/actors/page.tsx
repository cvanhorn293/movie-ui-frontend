import PeopleExplorer from "@/app/_components/people/PeopleExplorer";

export default function ActorsPage() {
    return (
        <PeopleExplorer
            department="Acting"
            title="Actors"
            subtitle="Search for actors, dive into their biographies and best-known roles, and save the ones you love to your collection."
            rolePlural="actors"
        />
    );
}
