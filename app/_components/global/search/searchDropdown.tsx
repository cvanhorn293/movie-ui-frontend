"use client";
import { useState } from "react";
import ChevronDownIcon from "@/app/_icons/ChevronDown.svg";

type SearchType = "actors" | "directors" | "movies";

interface SearchDropdownProps {
    value: SearchType;
    onChange: (value: SearchType) => void;
}

export default function SearchDropdown({ value, onChange }: SearchDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const options: { value: SearchType; label: string }[] = [
        { value: "actors", label: "Actors" },
        { value: "directors", label: "Directors" },
        { value: "movies", label: "Movies" },
    ];

    const selectedOption = options.find((option) => option.value === value);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-2 ml-1 px-2 py-1 text-sm font-medium text-gray-700 border border-gray bg-white hover:bg-gray-100 focus:outline-none cursor-pointer transition-colors rounded-lg"
            >
                <span>{selectedOption?.label}</span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 w-36 bg-dark-blue rounded-lg shadow-lg z-20">
                        <ul className="py-1">
                            {options.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm transition-colors ${option.value === value ? "bg-hover font-regular" : ""}`}
                                >
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}
