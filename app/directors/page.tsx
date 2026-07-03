import PeopleExplorer from "@/app/_components/people/PeopleExplorer";

export default function DirectorsPage() {
    return (
        <PeopleExplorer
            department="Directing"
            title="Directors"
            subtitle="Search for directors, explore their filmographies and signature work, and save the ones you love to your collection."
            rolePlural="directors"
        />
    );
}
