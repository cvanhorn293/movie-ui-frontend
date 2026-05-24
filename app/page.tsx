import MovieList from "./_components/MovieList";

export default function Home() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center font-sans">
            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
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
