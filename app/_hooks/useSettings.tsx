"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

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
    try {
        return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
        return "dark";
    }
}

function readBool(key: string, fallback: boolean): boolean {
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

function applyTheme(theme: ThemeMode) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function emitChange() {
    listeners.forEach((listener) => listener());
}

function getThemeSnapshot(): ThemeMode {
    return readTheme();
}

function getShowRatingsSnapshot(): boolean {
    return readBool(SHOW_RATINGS_STORAGE_KEY, true);
}

function getOgSnapshot(): boolean {
    return readBool(OG_STORAGE_KEY, false);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => "dark" as ThemeMode);
    const showRatings = useSyncExternalStore(subscribe, getShowRatingsSnapshot, () => true);
    const ogMode = useSyncExternalStore(subscribe, getOgSnapshot, () => false);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setTheme = useCallback((next: ThemeMode) => {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            // Ignore storage failures.
        }
        applyTheme(next);
        emitChange();
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [setTheme, theme]);

    const setShowRatings = useCallback((value: boolean) => {
        try {
            window.localStorage.setItem(SHOW_RATINGS_STORAGE_KEY, String(value));
        } catch {
            // Ignore storage failures.
        }
        emitChange();
    }, []);

    const setOgMode = useCallback((value: boolean) => {
        try {
            window.localStorage.setItem(OG_STORAGE_KEY, String(value));
        } catch {
            // Ignore storage failures.
        }
        emitChange();
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
