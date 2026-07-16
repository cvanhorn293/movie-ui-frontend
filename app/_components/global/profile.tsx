"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { getUserInitial, useAuth } from "@/app/_hooks/useAuth";

export default function Profile() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        await logout();
        router.push("/");
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
                <div className="hidden flex-col gap-1 sm:flex">
                    <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <Link href="/login" className="btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium">
                <span className="btn-gradient-text">Login</span>
            </Link>
        );
    }

    const displayName = user.displayName || user.email || "User";
    const avatarInitial = getUserInitial(displayName);

    return (
        <div className="relative rounded-lg border border-white/10 bg-card shadow-inner" ref={dropdownRef}>
            <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="mr-1.5 flex items-center gap-2 rounded-lg p-1.5 transition-all hover:bg-white/5">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent transition-all hover:ring-white/20" />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent ring-2 ring-transparent transition-all hover:ring-white/20">{avatarInitial}</div>
                )}
                <div className="hidden flex-col text-left roboto-flex sm:flex">
                    <span className="text-sm font-semibold text-primary">{displayName}</span>
                    <span className="text-xs text-secondary">Movie Lover</span>
                </div>
                <svg className="hidden h-4 w-4 text-secondary transition-transform sm:block" style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-card shadow-xl">
                    <div className="border-b border-white/10 p-4">
                        <p className="truncate text-sm font-medium text-primary">{displayName}</p>
                        <p className="mt-0.5 truncate text-xs text-secondary">{user.email}</p>
                    </div>
                    <div className="p-2">
                        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-secondary transition-colors hover:bg-white/5 hover:text-primary">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
