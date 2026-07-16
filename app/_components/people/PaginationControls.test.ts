import { describe, expect, it } from "vitest";
import { getTotalPages, paginateItems } from "./PaginationControls";

describe("paginateItems", () => {
    it("returns the correct page slice", () => {
        const items = [1, 2, 3, 4, 5];
        expect(paginateItems(items, 1, 2)).toEqual([1, 2]);
        expect(paginateItems(items, 2, 2)).toEqual([3, 4]);
        expect(paginateItems(items, 3, 2)).toEqual([5]);
    });
});

describe("getTotalPages", () => {
    it("rounds up and never returns less than 1", () => {
        expect(getTotalPages(5, 2)).toBe(3);
        expect(getTotalPages(0, 6)).toBe(1);
    });
});
