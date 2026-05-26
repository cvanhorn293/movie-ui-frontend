import MovieList from "./_components/MovieList";

export default function Home() {
    return (
        <div className="flex flex-row">
            <main className="flex w-full max-w-3xl flex-col items-center justify-between py-3 px-4 sm:items-start">
                <h1 className="font-roboto font-normal text-[32px] text-dark">Dashboard</h1>
                <MovieList
                    movies={[
                        { title: "Inception", director: "Christopher Nolan", year: 2010, genre: "Sci-Fi" },
                        {
                            title: "The Shawshank Redemption",
                            director: "Frank Darabont",
                            year: 1994,
                            genre: "Drama",
                        },
                        {
                            title: "The Godfather",
                            director: "Francis Ford Coppola",
                            year: 1972,
                            genre: "Crime",
                        },
                    ]}
                />
            </main>
        </div>
    );
}
