"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FunctionComponent, type SVGProps } from "react";
import { Actors, DashboardIcon, FilmIcon, SettingsIcon, MetroLogo, MetroIcon, ChevLeft, ChevRight, Favorites } from "./global/icons";
import Profile from "./global/profile";
import Search from "./global/search/searchBar";

type NavItem = {
    href: string;
    label: string;
    icon: FunctionComponent<SVGProps<SVGSVGElement>>;
    desktop: boolean;
};

const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: DashboardIcon, desktop: true },
    { href: "/people", label: "People", icon: Actors, desktop: true },
    { href: "/movies", label: "Movies", icon: FilmIcon, desktop: true },
    { href: "/favorites", label: "Favorites", icon: Favorites, desktop: true },
    { href: "/settings", label: "Settings", icon: SettingsIcon, desktop: false },
];

const getIsActive = (pathname: string, href: string): boolean => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    // Home and movie detail use edge-to-edge heroes; other pages keep default padding.
    const isFullBleed = isHome || /^\/movies\/\d+$/.test(pathname);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const navWithState = useMemo(() => navItems.map((item) => ({ ...item, active: getIsActive(pathname, item.href) })), [pathname]);
    const toggleSidebar = useCallback(() => setSidebarCollapsed((prev) => !prev), []);

    useEffect(() => {
        const main = mainRef.current;
        if (!main) return;

        // Frost the top bar once the main area has scrolled a bit.
        const handleScroll = () => setScrolled(main.scrollTop > 16);
        handleScroll();
        main.addEventListener("scroll", handleScroll, { passive: true });
        return () => main.removeEventListener("scroll", handleScroll);
    }, [pathname]);

    return (
        <div className="flex h-dvh min-h-0 bg-primary transition-colors duration-200">
            {/* Desktop sidebar */}
            <aside className={`hidden fixed top-0 left-0 bottom-0 md:flex flex-shrink-0 flex-col bg-nav lightest-gray h-screen transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
                <nav className="flex-1 py-2 px-4 overflow-y-auto">
                    <Image src={sidebarCollapsed ? MetroIcon : MetroLogo} alt="Metro Logo" loading="eager" className={`mx-auto mb-6 transition-opacity ${sidebarCollapsed ? "my-6 mb-12" : "my-3"}`} />

                    {/* Primary nav links */}
                    {navWithState
                        .filter((item) => item.desktop)
                        .map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center py-3 transition-colors roboto-flex 
                                        ${sidebarCollapsed ? "justify-center" : "px-4 py-2 my-2 rounded-lg"} 
                                        ${!item.active && !sidebarCollapsed ? "hover:bg-hover/35" : ""} 
                                        ${item.active && !sidebarCollapsed ? "bg-hover rounded-lg" : ""}
                                    `}
                                >
                                    <IconComponent className={` h-6 w-6 ${item.active && sidebarCollapsed ? "text-accent" : "lightest-gray"}  mb-1`} />
                                    {!sidebarCollapsed && <span className="ml-4 whitespace-nowrap font-medium">{item.label}</span>}
                                </Link>
                            );
                        })}
                </nav>

                {/* Settings + collapse control */}
                <div className="py-2 px-4">
                    <Link
                        href="/settings"
                        className={`flex items-center py-3 transition-colors rounded-lg roboto-flex ${sidebarCollapsed ? "justify-center" : "px-4 py-4"} ${
                            pathname === "/settings" && !sidebarCollapsed ? "bg-hover" : "hover:bg-hover/35"
                        }`}
                    >
                        <SettingsIcon className={`h-6 w-6 mb-1 ${pathname === "/settings" && sidebarCollapsed ? "text-accent" : "lightest-gray"}`} />
                        {!sidebarCollapsed && <span className="ml-4 whitespace-nowrap font-medium">Settings</span>}
                    </Link>

                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className={`flex cursor-pointer items-center py-3 transition-colors roboto-flex ${sidebarCollapsed ? "justify-center" : "px-4 py-4"}`}
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <span className="h-6 w-6"> {sidebarCollapsed ? <ChevRight /> : <ChevLeft />}</span>
                        <span className="inline-flex ml-4 whitespace-nowrap font-medium">{sidebarCollapsed ? "" : "Collapse"}</span>
                    </button>
                </div>
            </aside>

            {/* Fixed top bar: global search + profile */}
            <header
                className={`fixed top-0 right-0 left-0 z-30 flex items-center justify-between gap-4 px-4 py-4 transition-all duration-300 sm:px-6 ${sidebarCollapsed ? "md:left-16" : "md:left-64"} ${
                    scrolled ? "header-frosted border-b" : "border-b border-transparent bg-transparent"
                }`}
            >
                <Search variant={isHome ? "hero" : "default"} />
                <Profile />
            </header>

            {/* Scrollable page content — this element must own scroll for the frosted header */}
            <div
                ref={mainRef}
                data-main-scroll
                className={`min-h-0 flex-1 overflow-y-auto pb-20 md:pb-0 transition-all duration-300 ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}
            >
                {isFullBleed ? children : <div className="container mx-auto px-4 pt-24 pb-4 sm:px-6 sm:py-8 sm:pt-24">{children}</div>}
            </div>

            {/* Mobile bottom nav */}
            <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/10 bg-nav md:hidden">
                <div className="flex h-16 items-center justify-around">
                    {navWithState.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <Link key={item.href} href={item.href} className={`flex h-full flex-1 flex-col items-center justify-center transition-colors hover:bg-hover/35 ${item.active ? "bg-hover" : ""}`}>
                                <IconComponent className={`h-6 w-6 ${item.active ? "text-accent" : "text-secondary"}`} />
                                <span className={`mt-1 text-xs ${item.active ? "font-semibold text-accent" : "text-tertiary"}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
