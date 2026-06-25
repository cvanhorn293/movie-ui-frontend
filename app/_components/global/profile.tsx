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
        <div className="relative" ref={dropdownRef}>
            <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 rounded-lg transition-all hover:bg-white/5 p-1.5 -mr-1.5">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover ring-2 ring-transparent transition-all hover:ring-white/20" />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 text-sm font-semibold text-primary ring-2 ring-transparent transition-all hover:ring-white/20">{avatarInitial}</div>
                )}
                <div className="hidden flex-col roboto-flex sm:flex text-left">
                    <span className="font-semibold text-primary text-sm">{displayName}</span>
                    <span className="text-xs text-secondary">Movie Lover</span>
                </div>
                <svg className="hidden sm:block h-4 w-4 text-secondary transition-transform" style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card-nav-bg border border-white/10 shadow-xl backdrop-blur-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <p className="text-sm font-medium text-primary truncate">{displayName}</p>
                        <p className="text-xs text-secondary truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-2">
                        <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
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
