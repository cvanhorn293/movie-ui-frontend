import type { ReactNode } from "react";

interface SectionCardProps {
    title?: string;
    children: ReactNode;
    className?: string;
}

export default function SectionCard({ title, children, className = "" }: SectionCardProps) {
    return (
        <section className={`bg-card rounded-xl border border-white/5 p-5 sm:p-6 ${className}`}>
            {title && (
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-medium text-primary roboto-flex">{title}</h2>
                </div>
            )}
            {children}
        </section>
    );
}
