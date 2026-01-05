 import { useState, useEffect } from "react";

interface ColdBootProps {
    onComplete: () => void;
}

export function ColdBoot({ onComplete }: ColdBootProps) {
    const [started, setStarted] = useState(false);
    const [stage, setStage] = useState<
        "black" | "fade-bg" | "show-text" | "fade-text" | "complete"
    >("black");

    useEffect(() => {
        if (!started) {
            const handleInteraction = () => {
                setStarted(true);
            };

            window.addEventListener("keydown", handleInteraction, {
                once: true,
            });
            window.addEventListener("click", handleInteraction, { once: true });

            return () => {
                window.removeEventListener("keydown", handleInteraction);
                window.removeEventListener("click", handleInteraction);
            };
        }
    }, [started]);

    useEffect(() => {
        if (!started) return;

        // Play cold boot sound
        const audio = new Audio("/ps3/coldboot_stereo.wav");
        audio
            .play()
            .catch((err) =>
                console.error("Failed to play coldboot sound:", err)
            );

        // Allow ESC to skip boot sequence
        const handleSkip = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                audio.pause();
                setStage("complete");
                onComplete();
            }
        };

        window.addEventListener("keydown", handleSkip);

        // Stage 1: Black screen (0-1000ms)
        const timer1 = setTimeout(() => {
            setStage("fade-bg");
        }, 1000);

        // Stage 2: Fade in background (1000-3000ms)
        const timer2 = setTimeout(() => {
            setStage("show-text");
        }, 3000);

        // Stage 3: Show Sony text (3000-8000ms)
        const timer3 = setTimeout(() => {
            setStage("fade-text");
        }, 8000);

        // Stage 4: Fade out text (8000-10000ms)
        const timer4 = setTimeout(() => {
            setStage("complete");
            onComplete();
        }, 10000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
            window.removeEventListener("keydown", handleSkip);
            audio.pause();
        };
    }, [started, onComplete]);

    if (stage === "complete") {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-1500 ${
                    stage === "black" ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Press any key prompt */}
            {!started && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <span className="text-white/60 text-lg font-light tracking-wide animate-pulse">
                        Press any key
                    </span>
                </div>
            )}

            {/* Sony Computer Entertainment Text */}
            <div
                className={`absolute right-[10%] flex items-center justify-center transition-opacity duration-1000 ${
                    stage === "show-text"
                        ? "opacity-100"
                        : stage === "fade-text"
                        ? "opacity-0"
                        : "opacity-0"
                }`}
            >
                <span className="text-white text-2xl font-light tracking-wider">
                    Sony Computer Entertainment
                </span>
            </div>
        </div>
    );
}
