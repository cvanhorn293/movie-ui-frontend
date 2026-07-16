import { describe, expect, it } from "vitest";
import { formatCurrency, formatLanguage, formatReleaseDate, formatRuntime, getInitials } from "./movie-formatters";

describe("formatRuntime", () => {
    it("formats hours and minutes", () => {
        expect(formatRuntime(125)).toBe("2h 5m");
        expect(formatRuntime(120)).toBe("2h");
        expect(formatRuntime(45)).toBe("45m");
    });

    it("returns null for missing or invalid values", () => {
        expect(formatRuntime(null)).toBeNull();
        expect(formatRuntime(0)).toBeNull();
        expect(formatRuntime(-10)).toBeNull();
    });
});

describe("formatReleaseDate", () => {
    it("formats a valid ISO date", () => {
        expect(formatReleaseDate("2020-07-15")).toMatch(/2020/);
    });

    it("falls back to the year for invalid dates", () => {
        expect(formatReleaseDate("2019-xx-yy")).toBe("2019");
    });

    it("returns null for empty values", () => {
        expect(formatReleaseDate(null)).toBeNull();
        expect(formatReleaseDate("")).toBeNull();
    });
});

describe("formatLanguage", () => {
    it("maps known language codes", () => {
        expect(formatLanguage("en")).toBe("English");
        expect(formatLanguage("JA")).toBe("Japanese");
    });

    it("uppercases unknown codes", () => {
        expect(formatLanguage("sw")).toBe("SW");
    });
});

describe("formatCurrency", () => {
    it("formats positive USD amounts", () => {
        expect(formatCurrency(1500000)).toMatch(/1,?500,?000/);
    });

    it("returns null for missing or non-positive amounts", () => {
        expect(formatCurrency(null)).toBeNull();
        expect(formatCurrency(0)).toBeNull();
    });
});

describe("getInitials", () => {
    it("uses first and last name initials", () => {
        expect(getInitials("Jane Doe")).toBe("JD");
        expect(getInitials("Madonna")).toBe("M");
    });
});
