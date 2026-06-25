"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchCurrentUser, logoutUser } from "@/app/_lib/api";
import type { User } from "@/app/_lib/types";

export function useAuth() {
    const queryClient = useQueryClient();

    const { data: user, isLoading, isFetching, refetch } = useQuery({
        queryKey: ["me"],
        queryFn: fetchCurrentUser,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } finally {
            queryClient.setQueryData<User | null>(["me"], null);
            await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        }
    }, [queryClient]);

    return {
        user: user ?? null,
        isAuthenticated: Boolean(user?.id),
        isLoading,
        isFetching,
        refetch,
        logout,
    };
}

export function getProviderLabel(provider: User["provider"] | undefined): string {
    if (provider === "GITHUB") {
        return "Signed in with GitHub";
    }

    return "Signed in with Google";
}

export function getUserInitial(displayName: string | null | undefined): string {
    const trimmed = displayName?.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}
