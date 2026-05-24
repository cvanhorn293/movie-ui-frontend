"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FunctionComponent, type SVGProps } from "react";
import ActorsIcon from "../_icons/Actors.svg";
import DashboardIcon from "../_icons/Dashboard.svg";
import DirectorsIcon from "../_icons/Directors.svg";
import FilmIcon from "../_icons/Film.svg";
import SettingsIcon from "../_icons/Settings.svg";
import MetroLogo from "../_icons/Metro_Logo.png";
import MetroIcon from "../_icons/Metro_Icon.png";

type NavItem = {
    href: string;
    label: string;
    icon: FunctionComponent<SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: DashboardIcon },
    { href: "/actors", label: "Actors", icon: ActorsIcon },
    { href: "/directors", label: "Directors", icon: DirectorsIcon },
    { href: "/movies", label: "Movies", icon: FilmIcon }
];

const getIsActive = (pathname: string, href: string): boolean =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [hasUserPreference, setHasUserPreference] = useState(false);
    const mountedRef = useRef(false);

    const navWithState = useMemo(
        () => navItems.map((item) => ({ ...item, active: getIsActive(pathname, item.href) })),
        [pathname],
    );

    const toggleDarkMode = useCallback(() => {
        setHasUserPreference(true);
        setDarkMode((prev) => !prev);
    }, []);

    const toggleSidebar = useCallback(() => setSidebarCollapsed((prev) => !prev), []);

    // Initialize dark mode after hydration to prevent mismatch
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        mountedRef.current = true;
        
        const saved = localStorage.getItem("darkMode");
        if (saved !== null) {
            setDarkMode(saved === "true");
            setHasUserPreference(true);
        } else {
            setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
        }
    }, []);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Manage dark mode class and localStorage
    useEffect(() => {
        if (!mountedRef.current) return;
        document.documentElement.classList.toggle("dark", darkMode);
        if (hasUserPreference) {
            localStorage.setItem("darkMode", String(darkMode));
        }
    }, [darkMode, hasUserPreference]);

    // Listen for system theme changes if user hasn't set a preference
    useEffect(() => {
        if (!mountedRef.current || hasUserPreference) return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [hasUserPreference]);

    return (
        <div className="flex min-h-screen bg-off-whitetransition-colors duration-200">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-shrink-0 flex-col bg-dark font-headings transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}
            >
                <nav className="flex-1 py-2 px-4">
                    {/* Navigation Logo / Icon */}
                    <Image src={sidebarCollapsed ? MetroIcon : MetroLogo} alt="Metro Logo" className="mx-auto mb-6 transition-opacity" />
                    
                    {/* Navigation items */}
                    {navWithState.map((item) => {
                        const IconComponent = item.icon;
                        return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center py-3 transition-colors hover:bg-hover roboto-flex ${sidebarCollapsed ? "justify-center" : "px-4 py-4"} ${item.active ? "bg-hover rounded-lg" : ""}`}
                        >
                            <IconComponent className="h-6 w-6 font-headings mb-1" />
                            {!sidebarCollapsed && (
                                <span className="ml-4 whitespace-nowrap font-medium">{item.label}</span>
                            )}
                        </Link>
                        );
                    })}
                </nav>

                <div>
                    <Link href="/settings" className={`flex items-center py-3 transition-colors hover:bg-hover roboto-flex ${sidebarCollapsed ? "justify-center" : "px-4 py-4"}`}>
                        <SettingsIcon className="h-6 w-6 font-headings mb-1" />
                        {!sidebarCollapsed && (
                            <span className="ml-4 whitespace-nowrap font-medium">Settings</span>
                        )}
                    </Link>
                </div>

                {/* Dark Mode Toggle */}
                <div className="border-t border-gray-700">
                    <button
                        type="button"
                        onClick={toggleDarkMode}
                        className={`flex w-full items-center px-4 py-4 transition-colors hover:bg-hover ${sidebarCollapsed ? "justify-center" : ""}`}
                        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-xs font-semibold">
                            {darkMode ? "🌙" : "☀️"}
                        </span>
                        {!sidebarCollapsed && (
                            <span className="ml-4 whitespace-nowrap font-medium">
                                {darkMode ? "Dark Mode" : "Light Mode"}
                            </span>
                        )}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <div className="border-t border-gray-700">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="flex w-full items-center justify-center px-4 py-4 transition-colors hover:bg-gray-700"
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm font-semibold">
                            {sidebarCollapsed ? "→" : "←"}
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto pb-20 md:pb-0">
                {/* Mobile Dark Mode Toggle */}
                <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="fixed top-4 right-4 z-40 rounded-full bg-gray-800 p-3 text-lg shadow-lg transition-colors hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 md:hidden"
                    title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {darkMode ? "🌙" : "☀️"}
                </button>

                <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-8">{children}</div>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 md:hidden">
                <div className="flex h-16 items-center justify-around">
                    {navWithState.map((item) => {
                        const IconComponent = item.icon;
                        return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex h-full flex-1 flex-col items-center justify-center transition-colors hover:bg-gray-700 ${item.active ? "bg-blue-500/30" : ""}`}
                        >
                            <IconComponent className={`h-6 w-6 ${item.active ? "text-blue-300" : "text-gray-300"}`} />
                            <span className={`mt-1 text-xs ${item.active ? "font-semibold text-blue-300" : "text-gray-400"}`}>
                                {item.label}
                            </span>
                        </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
