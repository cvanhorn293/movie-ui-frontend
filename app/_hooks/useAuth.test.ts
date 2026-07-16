import { describe, expect, it } from "vitest";
import { getProviderLabel, getUserInitial } from "./useAuth";

describe("getProviderLabel", () => {
    it("labels GitHub and Google providers", () => {
        expect(getProviderLabel("GITHUB")).toBe("Signed in with GitHub");
        expect(getProviderLabel("GOOGLE")).toBe("Signed in with Google");
        expect(getProviderLabel(undefined)).toBe("Signed in with Google");
    });
});

describe("getUserInitial", () => {
    it("returns the first letter or a fallback", () => {
        expect(getUserInitial("alex")).toBe("A");
        expect(getUserInitial("  sam  ")).toBe("S");
        expect(getUserInitial(null)).toBe("?");
        expect(getUserInitial("")).toBe("?");
    });
});
