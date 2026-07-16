import { describe, expect, it } from "vitest";
import { API_BASE_URL, getOAuthLoginUrl } from "./api";

describe("getOAuthLoginUrl", () => {
    it("builds the Spring OAuth authorization URL", () => {
        expect(getOAuthLoginUrl("google")).toBe(`${API_BASE_URL}/oauth2/authorization/google`);
        expect(getOAuthLoginUrl("github")).toBe(`${API_BASE_URL}/oauth2/authorization/github`);
    });
});
