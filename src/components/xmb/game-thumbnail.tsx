import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { cn, withBase } from "@/lib/utils";

interface GameThumbnailProps {
    src: string | null;
    alt: string;
    width?: number;
    height?: number;
    isSelected?: boolean;
    className?: string;
}

export function GameThumbnail({
    src,
    alt,
    width = 80,
    height = 56,
    isSelected,
    className,
}: GameThumbnailProps) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-white/5",
                    className
                )}
                style={{ width, height }}
            >
                <Gamepad2
                    size={Math.min(width, height) * 0.6}
                    className="text-white/50"
                    strokeWidth={1.5}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "relative overflow-hidden",
                isSelected && "shadow-[0_0_20px_rgba(255,255,255,0.2)]",
                className
            )}
            style={{ width, height }}
        >
            <img
                src={src || withBase("/placeholder.svg")}
                alt={alt}
                className="object-cover w-full h-full"
                onError={() => setError(true)}
            />
        </div>
    );
}
