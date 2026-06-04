"use client";
import React, { useState } from "react";
import SearchDropdown from "./searchDropdown";
import SearchIcon from "@/app/_icons/Search.svg";

type SearchType = "actors" | "directors" | "movies";

export default function SearchBar() {
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

    return (
        <div className="relative w-full max-w-sm">
            <div className="flex items-center bg-off-white border border-gray rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                <SearchDropdown value={searchType} onChange={setSearchType} />
                <input name="search" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyPress} placeholder={`Search ${searchType}...`} className="flex-1 px-4 py-2 focus:outline-none text-medium-blue text-sm" style={{ paddingLeft: "0.5rem" }} />
                <button type="button" onClick={handleSearch} className="mr-1 px-2 py-2 bg-brand-blue hover:bg-hover transition-colors rounded-lg cursor-pointer" aria-label="Search">
                    <SearchIcon className="w-4 h-4 text-off-white " />
                </button>
            </div>
        </div>
    );
}
