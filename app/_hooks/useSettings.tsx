"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "metro-theme";
const SHOW_RATINGS_STORAGE_KEY = "metro-show-ratings";
const OG_STORAGE_KEY = "metro-og";

interface SettingsContextValue {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
    showRatings: boolean;
    setShowRatings: (value: boolean) => void;
    ogMode: boolean;
    setOgMode: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readTheme(): ThemeMode {
    if (typeof window === "undefined") {
        return "dark";
    }

    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return stored === "light" ? "light" : "dark";
    } catch {
        return "dark";
    }
}

function readBool(key: string, fallback: boolean): boolean {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const stored = window.localStorage.getItem(key);
        if (stored == null) {
            return fallback;
        }
        return stored === "true";
    } catch {
        return fallback;
    }
}

function writeBool(key: string, value: boolean) {
    try {
        window.localStorage.setItem(key, String(value));
    } catch {
        // Ignore storage failures.
    }
}

function applyTheme(theme: ThemeMode) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>("dark");
    const [showRatings, setShowRatingsState] = useState(true);
    const [ogMode, setOgModeState] = useState(false);

    useEffect(() => {
        const nextTheme = readTheme();
        setThemeState(nextTheme);
        setShowRatingsState(readBool(SHOW_RATINGS_STORAGE_KEY, true));
        setOgModeState(readBool(OG_STORAGE_KEY, false));
        applyTheme(nextTheme);
    }, []);

    const setTheme = useCallback((next: ThemeMode) => {
        setThemeState(next);
        applyTheme(next);
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            // Ignore storage failures.
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [setTheme, theme]);

    const setShowRatings = useCallback((value: boolean) => {
        setShowRatingsState(value);
        writeBool(SHOW_RATINGS_STORAGE_KEY, value);
    }, []);

    const setOgMode = useCallback((value: boolean) => {
        setOgModeState(value);
        writeBool(OG_STORAGE_KEY, value);
    }, []);

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme,
            showRatings,
            setShowRatings,
            ogMode,
            setOgMode,
        }),
        [theme, setTheme, toggleTheme, showRatings, setShowRatings, ogMode, setOgMode],
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within SettingsProvider");
    }
    return context;
}
