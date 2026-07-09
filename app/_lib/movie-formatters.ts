const LANGUAGE_NAMES: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    hi: "Hindi",
    pt: "Portuguese",
    ru: "Russian",
};

export function formatRuntime(minutes: number | null | undefined): string | null {
    if (minutes == null || minutes <= 0) {
        return null;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
        return `${mins}m`;
    }
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatReleaseDate(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value.slice(0, 4);
    }
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function formatLanguage(code: string | null | undefined): string | null {
    if (!code) {
        return null;
    }
    return LANGUAGE_NAMES[code.toLowerCase()] ?? code.toUpperCase();
}

export function formatCurrency(amount: number | null | undefined): string | null {
    if (amount == null || amount <= 0) {
        return null;
    }
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}
