"use client";

import { ChevLeft, ChevRight } from "@/app/_components/global/icons";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-3 pt-2">
            <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-white/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevLeft className="h-3.5 w-3.5" />
                Previous
            </button>

            <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            page === currentPage ? "bg-accent-soft text-accent" : "text-secondary hover:bg-white/5 hover:text-primary"
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-white/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
                Next
                <ChevRight className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
}

export function getTotalPages(itemCount: number, pageSize: number): number {
    return Math.max(1, Math.ceil(itemCount / pageSize));
}
