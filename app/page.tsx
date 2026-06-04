"use client";

import Card from "./_components/card";
import { ActorsIcon, DirectorsIcon } from "./_components/global/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchActors = async () => {
    const response = await axios.get("http://localhost:8080/api/actors");
    return response.data;
};

const fetchDirectors = async () => {
    const response = await axios.get("http://localhost:8080/api/directors");
    return response.data;
};

export default function Home() {
    const {
        data: actorsData,
        isLoading: actorsLoading,
        error: actorsError,
    } = useQuery({
        queryKey: ["actors"],
        queryFn: fetchActors,
        enabled: true,
    });

    const {
        data: directorsData,
        isLoading: directorsLoading,
        error: directorsError,
    } = useQuery({
        queryKey: ["directors"],
        queryFn: fetchDirectors,
        enabled: true,
    });

    // Example mock data with separate first/last names (remove when using real API)
    const mockActorsData = [
        { id: 1, firstName: "Tom", lastName: "Hanks", movies_starred_in: "Forrest Gump, Saving Private Ryan, Cast Away" },
        { id: 2, firstName: "Meryl", lastName: "Streep", movies_starred_in: "The Devil Wears Prada, Sophie's Choice" },
        { id: 3, firstName: "Leonardo", lastName: "DiCaprio", movies_starred_in: "Inception, Titanic, The Revenant" },
        { id: 4, firstName: "Denzel", lastName: "Washington", movies_starred_in: "Training Day, Malcolm X, Glory" },
        { id: 5, firstName: "Julia", lastName: "Roberts", movies_starred_in: "Pretty Woman, Erin Brockovich, Notting Hill" },
        { id: 6, firstName: "Brad", lastName: "Pitt", movies_starred_in: "Fight Club, Se7en, Once Upon a Time" },
        { id: 7, firstName: "Cate", lastName: "Blanchett", movies_starred_in: "The Lord of the Rings, Carol, Blue Jasmine" },
        { id: 8, firstName: "Morgan", lastName: "Freeman", movies_starred_in: "Shawshank Redemption, Seven, Bruce Almighty" },
        { id: 9, firstName: "Natalie", lastName: "Portman", movies_starred_in: "Black Swan, V for Vendetta, Jackie" },
        { id: 10, firstName: "Robert", lastName: "De Niro", movies_starred_in: "Taxi Driver, Goodfellas, The Godfather Part II" },
    ];

    const mockDirectorsData = [
        { id: 1, name: "Steven Spielberg", movies_directed: "Jurassic Park, E.T., Schindler's List" },
        { id: 2, name: "Christopher Nolan", movies_directed: "Inception, The Dark Knight, Interstellar" },
        { id: 3, name: "Martin Scorsese", movies_directed: "Goodfellas, The Departed, Taxi Driver" },
        { id: 4, name: "Quentin Tarantino", movies_directed: "Pulp Fiction, Kill Bill, Django Unchained" },
        { id: 5, name: "Francis Ford Coppola", movies_directed: "The Godfather, Apocalypse Now" },
    ];

    return (
        <div className="flex flex-row">
            <main className="flex w-full flex-col items-center justify-between py-3 px-4 sm:items-start">
                <h1 className="font-roboto font-normal text-[32px] text-dark mb-4">Dashboard</h1>
                <div className="grid grid-cols-12 gap-8 w-full">
                    <Card
                        colSpan={6}
                        title="Actors Overview"
                        icon={ActorsIcon}
                        button={true}
                        buttonText="View All"
                        dataHeader={[
                            { headerText: "Id", headerWidth: 8, dataKey: "id" },
                            {
                                headerText: "Name",
                                headerWidth: 32,
                                renderCell: (row) => `${row.firstName} ${row.lastName}`,
                            },
                            { headerText: "Movies Starred In", headerWidth: 60, dataKey: "dateOfBirth" },
                        ]}
                        data={actorsData || mockActorsData}
                        isLoading={actorsLoading}
                        error={actorsError?.message}
                        pagination={true}
                    />
                    <Card
                        colSpan={6}
                        title="Directors Overview"
                        icon={DirectorsIcon}
                        dataHeader={[
                            { headerText: "Id", headerWidth: 8 },
                            { headerText: "Name", headerWidth: 32 },
                            { headerText: "Movies Directed", headerWidth: 60 },
                        ]}
                        data={directorsData}
                        isLoading={directorsLoading}
                        error={directorsError?.message}
                        pagination={true}
                    />
                </div>
            </main>
        </div>
    );
}
