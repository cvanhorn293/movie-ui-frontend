"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getOAuthLoginUrl } from "@/app/_lib/api";
import { useAuth } from "@/app/_hooks/useAuth";
import GitHubLogo from "@/app/_icons/GitHub_Invertocat_White.svg";

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace("/");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || isAuthenticated) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
            </div>
        );
    }

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">Welcome to Metro</p>
            <h1 className="mt-3 text-3xl font-semibold text-primary sm:text-4xl">Sign in to your movie collection</h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-secondary">Log in with Google or GitHub to unlock your personalized dashboard, favorites, and collection insights.</p>

            <div className="mt-10 flex w-full flex-col gap-4">
                <a href={getOAuthLoginUrl("google")} className="btn-gradient flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-[15px] font-medium tracking-wide">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="btn-gradient-text">Continue with Google</span>
                </a>
                <a href={getOAuthLoginUrl("github")} className="btn-secondary flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-[15px] font-medium tracking-wide text-primary">
                    <GitHubLogo className="h-5 w-5" />
                    <span>Continue with GitHub</span>
                </a>
            </div>

            <Link href="/" className="mt-4 text-sm text-secondary transition-colors hover:text-primary">
                Continue without signing in
            </Link>
        </div>
    );
}
