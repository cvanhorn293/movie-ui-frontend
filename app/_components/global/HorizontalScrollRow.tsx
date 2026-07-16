"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevLeft, ChevRight } from "@/app/_components/global/icons";

/**
 * Netflix-style row: full cards fit in the content width; peek cards sit in the side bleed.
 * Pass itemsPerPage="auto" to size by viewport, a number to force a count, or omit to leave widths alone.
 */
interface HorizontalScrollRowProps {
    children: ReactNode;
    className?: string;
    ariaLabel?: string;
    itemsPerPage?: number | "auto";
    gap?: number;
}

function getAutoItemsPerPage(width: number): number {
    if (width < 480) return 2;
    if (width < 720) return 3;
    if (width < 960) return 4;
    if (width < 1200) return 5;
    return 6;
}

/** Prefer the main scroll container so bleed lines up with page content gutters. */
function findMainScroll(el: HTMLElement | null): HTMLElement | null {
    if (!el) return null;
    return el.closest<HTMLElement>("[data-main-scroll]") ?? (el.closest("main") as HTMLElement | null);
}

function ScrollArrow({ direction, onClick, height, width }: { direction: "left" | "right"; onClick: () => void; height: number | null; width: number }) {
    const isLeft = direction === "left";

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={isLeft ? "Show previous items" : "Show more items"}
            className={`absolute top-0 z-20 flex items-center justify-center transition-opacity duration-200 ${isLeft ? "left-0 bg-black/45 hover:bg-black/60" : "right-0 bg-black/45 hover:bg-black/60"} opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100`}
            style={{ width: Math.max(width, 40), height: height ?? "72%" }}
        >
            {isLeft ? <ChevLeft className="h-7 w-7 text-white sm:h-8 sm:w-8" /> : <ChevRight className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
        </button>
    );
}

export default function HorizontalScrollRow({ children, className = "", ariaLabel, itemsPerPage, gap = 16 }: HorizontalScrollRowProps) {
    const railRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [arrowHeight, setArrowHeight] = useState<number | null>(null);
    const [leftBleed, setLeftBleed] = useState(0);
    const [rightBleed, setRightBleed] = useState(0);
    const [cardWidth, setCardWidth] = useState<number | null>(null);
    const [pageSize, setPageSize] = useState(6);

    const sizeItems = itemsPerPage != null;

    const updateMetrics = useCallback(() => {
        const rail = railRef.current;
        const container = scrollRef.current;
        if (!rail || !container) return;

        const main = findMainScroll(rail);
        const railRect = rail.getBoundingClientRect();
        const mainRect = main?.getBoundingClientRect();

        const measuredLeft = mainRect ? Math.max(0, Math.round(railRect.left - mainRect.left)) : 0;
        const measuredRight = mainRect ? Math.max(0, Math.round(mainRect.right - railRect.right)) : 0;

        const controlledWidth = rail.clientWidth;
        const nextPageSize = itemsPerPage === "auto" || itemsPerPage == null ? getAutoItemsPerPage(controlledWidth) : itemsPerPage;

        let nextCardWidth: number | null = null;
        if (sizeItems && nextPageSize > 0) {
            nextCardWidth = (controlledWidth - gap * (nextPageSize - 1)) / nextPageSize;
        }

        // Left bleed matches the real content gutter so the first card lines up with titles.
        // Right bleed keeps a visible preview zone outside the controlled width.
        const minPeek = nextCardWidth != null ? Math.round(nextCardWidth * 0.35) : 56;
        const nextLeftBleed = measuredLeft;
        const nextRightBleed = Math.max(measuredRight, minPeek);

        setPageSize(nextPageSize);
        setCardWidth(nextCardWidth);
        setLeftBleed(nextLeftBleed);
        setRightBleed(nextRightBleed);

        const { scrollLeft, scrollWidth, clientWidth } = container;
        const maxScroll = scrollWidth - clientWidth;
        setCanScrollLeft(scrollLeft > 2);
        setCanScrollRight(maxScroll > 2 && scrollLeft < maxScroll - 2);

        const poster = container.querySelector<HTMLElement>("[data-scroll-poster]");
        const nextHeight = poster?.offsetHeight ?? null;
        setArrowHeight((current) => (current === nextHeight ? current : nextHeight));
    }, [gap, itemsPerPage, sizeItems]);

    useEffect(() => {
        const rail = railRef.current;
        const container = scrollRef.current;
        if (!rail || !container) return;

        updateMetrics();
        const frame = requestAnimationFrame(updateMetrics);

        const resizeObserver = new ResizeObserver(updateMetrics);
        resizeObserver.observe(rail);
        resizeObserver.observe(container);

        const main = findMainScroll(rail);
        if (main) {
            resizeObserver.observe(main);
        }

        for (const child of container.children) {
            if (child instanceof HTMLElement) {
                resizeObserver.observe(child);
            }
        }

        container.addEventListener("scroll", updateMetrics, { passive: true });
        window.addEventListener("resize", updateMetrics);

        const images = container.querySelectorAll("img");
        images.forEach((image) => {
            if (!image.complete) {
                image.addEventListener("load", updateMetrics, { once: true });
            }
        });

        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            container.removeEventListener("scroll", updateMetrics);
            window.removeEventListener("resize", updateMetrics);
        };
    }, [updateMetrics, children]);

    const scrollByPage = (direction: "left" | "right") => {
        const container = scrollRef.current;
        if (!container || container.children.length === 0) return;

        const firstChild = container.children[0] as HTMLElement;
        const resolvedCardWidth = cardWidth ?? firstChild.getBoundingClientRect().width;
        const amount = pageSize * (resolvedCardWidth + gap);
        const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
        const current = container.scrollLeft;

        // Snap to the real ends so the last page lands on the controlled content edge.
        if (direction === "right") {
            const remaining = maxScroll - current;
            const next = remaining <= amount + 2 ? maxScroll : current + amount;
            container.scrollTo({ left: next, behavior: "smooth" });
            return;
        }

        const next = current <= amount + 2 ? 0 : current - amount;
        container.scrollTo({ left: next, behavior: "smooth" });
    };

    const trackStyle: CSSProperties = {
        width: `calc(100% + ${leftBleed + rightBleed}px)`,
        marginLeft: -leftBleed,
        marginRight: -rightBleed,
        ...(cardWidth != null
            ? ({
                  ["--carousel-card-width" as string]: `${cardWidth}px`,
                  ["--carousel-gap" as string]: `${gap}px`,
              } as CSSProperties)
            : null),
    };

    return (
        <div ref={railRef} className="relative w-full">
            <div className="group/carousel relative" style={trackStyle}>
                {canScrollLeft && <ScrollArrow direction="left" onClick={() => scrollByPage("left")} height={arrowHeight} width={leftBleed} />}
                {canScrollRight && <ScrollArrow direction="right" onClick={() => scrollByPage("right")} height={arrowHeight} width={rightBleed} />}

                <div ref={scrollRef} className={`no-scrollbar flex overflow-x-auto scroll-smooth pb-2 ${className}`} style={{ gap, paddingLeft: leftBleed, paddingRight: rightBleed }} role={ariaLabel ? "region" : undefined} aria-label={ariaLabel}>
                    {children}
                </div>
            </div>
        </div>
    );
}
