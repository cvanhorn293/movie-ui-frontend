"use client";
import React, { useState } from "react";
import SearchIcon from "@/app/_icons/Search.svg";

type SearchType = "actors" | "directors" | "movies";

interface SearchBarProps {
    variant?: "default" | "hero";
}

export default function SearchBar({ variant = "default" }: SearchBarProps) {
    const [searchType, setSearchType] = useState<SearchType>("movies");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        console.log(`Searching ${searchType} for:`, searchQuery);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const isHero = variant === "hero";

    return (
        <div className={`relative w-full ${isHero ? "max-w-2xl" : "max-w-xl"}`}>
            <div
                className={`flex items-center rounded-lg border focus-within:border-white/10 focus-within:ring-1 focus-within:ring-white/10 ${
                    isHero ? "border-white/10 bg-black/30 shadow-lg backdrop-blur-md" : "border-white/5 bg-card shadow-inner"
                }`}
            >
                <button type="button" onClick={handleSearch} className="mr-1 px-4 py-3 transition-colors rounded-lg cursor-pointer" aria-label="Search">
                    <SearchIcon className="w-4 h-4 text-off-white " />
                </button>
                <input
                    name="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Search for movies, directors, or actors...`}
                    className="flex-1 px-4 py-2 focus:outline-none text-medium-blue text-sm"
                    style={{ paddingLeft: "0.5rem" }}
                />
            </div>
        </div>
    );
}
