"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type WheelEvent } from "react";
import { ChevLeft, ChevRight } from "@/app/_components/global/icons";

interface HorizontalScrollRowProps {
    children: ReactNode;
    className?: string;
    /** Space reserved below the poster area so arrows align with artwork, not titles. */
    controlsInsetBottom?: string;
    ariaLabel?: string;
}

function ScrollArrow({
    direction,
    onClick,
    insetBottom,
}: {
    direction: "left" | "right";
    onClick: () => void;
    insetBottom: string;
}) {
    const isLeft = direction === "left";

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={isLeft ? "Show previous items" : "Show more items"}
            className={`absolute top-0 z-20 flex w-10 items-center justify-center sm:w-14 ${
                isLeft
                    ? "left-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent pl-0.5 sm:pl-1"
                    : "right-0 bg-gradient-to-l from-black/80 via-black/50 to-transparent pr-0.5 sm:pr-1"
            }`}
            style={{ bottom: insetBottom }}
        >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 backdrop-blur-sm transition-transform hover:scale-110 hover:border-white/35 hover:bg-black/75">
                {isLeft ? <ChevLeft className="h-4 w-4" /> : <ChevRight className="h-4 w-4" />}
            </span>
        </button>
    );
}

export default function HorizontalScrollRow({
    children,
    className = "",
    controlsInsetBottom = "3.5rem",
    ariaLabel,
}: HorizontalScrollRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const container = scrollRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 4);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }, []);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        updateScrollState();

        const resizeObserver = new ResizeObserver(updateScrollState);
        resizeObserver.observe(container);
        container.addEventListener("scroll", updateScrollState, { passive: true });

        return () => {
            resizeObserver.disconnect();
            container.removeEventListener("scroll", updateScrollState);
        };
    }, [updateScrollState, children]);

    const getScrollStep = () => {
        const container = scrollRef.current;
        if (!container || container.children.length === 0) {
            return container?.clientWidth ?? 0;
        }

        const firstChild = container.children[0] as HTMLElement;
        const style = getComputedStyle(container);
        const gap = parseFloat(style.columnGap || style.gap) || 16;
        const cardWidth = firstChild.getBoundingClientRect().width;
        const visibleCount = Math.max(1, Math.floor((container.clientWidth + gap) / (cardWidth + gap)));

        return visibleCount * (cardWidth + gap);
    };

    const scroll = (direction: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;

        const step = getScrollStep();
        const maxScroll = container.scrollWidth - container.clientWidth;
        const next =
            direction === "right"
                ? Math.min(container.scrollLeft + step, maxScroll)
                : Math.max(container.scrollLeft - step, 0);

        container.scrollTo({ left: next, behavior: "smooth" });
    };

    const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
        const container = scrollRef.current;
        if (!container || container.scrollWidth <= container.clientWidth) return;

        event.preventDefault();
        container.scrollLeft += event.deltaY;
    };

    return (
        <div className="relative">
            {canScrollLeft && <ScrollArrow direction="left" onClick={() => scroll("left")} insetBottom={controlsInsetBottom} />}
            {canScrollRight && <ScrollArrow direction="right" onClick={() => scroll("right")} insetBottom={controlsInsetBottom} />}

            <div
                ref={scrollRef}
                onWheel={handleWheel}
                className={`no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2 ${className}`}
                role={ariaLabel ? "region" : undefined}
                aria-label={ariaLabel}
            >
                {children}
            </div>
        </div>
    );
}
