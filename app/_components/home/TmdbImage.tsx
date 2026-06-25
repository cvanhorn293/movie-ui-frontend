import type { ImgHTMLAttributes } from "react";
import { buildTmdbImageUrl, type TmdbImageSize } from "@/app/_lib/tmdb-images";

interface TmdbImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
    src: string | null | undefined;
    alt: string;
    size?: TmdbImageSize;
}

export default function TmdbImage({ src, alt, size = "w500", className, ...props }: TmdbImageProps) {
    const imageUrl = buildTmdbImageUrl(src, size);

    if (!imageUrl) {
        return null;
    }

    return <img src={imageUrl} alt={alt} className={className} loading="lazy" {...props} />;
}
