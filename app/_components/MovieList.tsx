"use client";
import React from "react";

interface MovieData {
    title: string;
    director: string;
    year: number;
    genre: string;
}

interface MovieListProps {
    movies: MovieData[];
}

export default function MovieList({ movies }: MovieListProps) {
    return (
        <div>
            {movies.map((movie, index) => (
                <div key={index}>
                    <h2>{movie.title}</h2>
                    <p>Director: {movie.director}</p>
                    <p>Year: {movie.year}</p>
                    <p>Genre: {movie.genre}</p>
                </div>
            ))}
        </div>
    );
}
