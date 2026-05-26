"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState, type FunctionComponent, type SVGProps } from "react";
import { ActorsIcon, DashboardIcon, DirectorsIcon, FilmIcon, SettingsIcon, MetroLogo, MetroIcon, ChevLeft, ChevRight } from "./utilities/Icons";

type NavItem = {
    href: string;
    label: string;
    icon: FunctionComponent<SVGProps<SVGSVGElement>>;
    desktop: boolean;
};

const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: DashboardIcon, desktop: true },
    { href: "/actors", label: "Actors", icon: ActorsIcon, desktop: true },
    { href: "/directors", label: "Directors", icon: DirectorsIcon, desktop: true },
    { href: "/movies", label: "Movies", icon: FilmIcon, desktop: true },
    { href: "/settings", label: "Settings", icon: SettingsIcon, desktop: false },
];

const getIsActive = (pathname: string, href: string): boolean => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navWithState = useMemo(() => navItems.map((item) => ({ ...item, active: getIsActive(pathname, item.href) })), [pathname]);
    const toggleSidebar = useCallback(() => setSidebarCollapsed((prev) => !prev), []);

    return (
        <div className="flex min-h-screen bg-off-whitetransition-colors duration-200">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-shrink-0 flex-col bg-dark font-headings transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
                <nav className="flex-1 py-2 px-4">
                    {/* Navigation Logo / Icon */}
                    <Image src={sidebarCollapsed ? MetroIcon : MetroLogo} alt="Metro Logo" className={`mx-auto mb-6 transition-opacity ${sidebarCollapsed ? "my-6 mb-12" : "my-3"}`} />

                    {/* Navigation items */}
                    {navWithState
                        .filter((item) => item.desktop)
                        .map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link key={item.href} href={item.href} className={`flex items-center py-3 transition-colors roboto-flex ${sidebarCollapsed ? "justify-center" : "px-4 py-2 my-2 hover:bg-gray-700 rounded-lg"} ${item.active && !sidebarCollapsed ? "bg-hover rounded-lg" : ""}`}>
                                    <IconComponent className={` h-6 w-6 ${item.active && sidebarCollapsed ? "text-blue-300" : "font-headings"}  mb-1`} />
                                    {!sidebarCollapsed && <span className="ml-4 whitespace-nowrap font-medium">{item.label}</span>}
                                </Link>
                            );
                        })}
                </nav>

                {/* Settings */}
                <div className="py-2 px-4">
                    <Link href="/settings" className={`flex items-center py-3 transition-colors hover:bg-hover roboto-flex ${sidebarCollapsed ? "justify-center" : "px-4 py-4"}`}>
                        <SettingsIcon className="h-6 w-6 font-headings mb-1" />
                        {!sidebarCollapsed && <span className="ml-4 whitespace-nowrap font-medium">Settings</span>}
                    </Link>

                    {/* Collapse Toggle */}
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className={`flex cursor-pointer items-center py-3 transition-colors hover:bg-hover roboto-flex ${sidebarCollapsed ? "justify-center" : "px-4 py-4"}`}
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <span className="h-6 w-6"> {sidebarCollapsed ? <ChevRight /> : <ChevLeft />}</span>
                        <span className="inline-flex ml-4 whitespace-nowrap font-medium">{sidebarCollapsed ? "" : "Collapse"}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto pb-20 md:pb-0">
                <div className="bg-white sticky top-0 z-10 border-b border-gray-200 h-16 flex items-center px-4 sm:px-6">
                    {/* TODO: Search Component Here */}
                    {/* TODO: Profile Component Here */}
                </div>
                <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-8">{children}</div>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 md:hidden">
                <div className="flex h-16 items-center justify-around">
                    {navWithState.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <Link key={item.href} href={item.href} className={`flex h-full flex-1 flex-col items-center justify-center transition-colors hover:bg-gray-700 ${item.active ? "bg-hover" : ""}`}>
                                <IconComponent className={`h-6 w-6 ${item.active ? "text-blue-300" : "text-gray-300"}`} />
                                <span className={`mt-1 text-xs ${item.active ? "font-semibold text-blue-300" : "text-gray-400"}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
