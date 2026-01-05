import { useCallback, useRef, useEffect } from "react";

type SoundType = "navigate" | "select" | "back" | "category" | "startup";

const SOUND_BASE_FILES: Record<SoundType, string> = {
    navigate: "/ps3/snd_cursor",
    select: "/ps3/snd_decide",
    back: "/ps3/snd_cancel",
    category: "/ps3/snd_category_decide",
    startup: "/ps3/snd_system_ok",
};

export function useXMBSounds() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const bufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    const loadStereoBuffer = async (
        basePath: string
    ): Promise<AudioBuffer | null> => {
        const ctx = getAudioContext();
        try {
            // Load both channels
            const [resp0, resp1] = await Promise.all([
                fetch(`${basePath}.ch0.wav`),
                fetch(`${basePath}.ch1.wav`),
            ]);

            const [ab0, ab1] = await Promise.all([
                resp0.arrayBuffer(),
                resp1.arrayBuffer(),
            ]);

            const [buf0, buf1] = await Promise.all([
                ctx.decodeAudioData(ab0),
                ctx.decodeAudioData(ab1),
            ]);

            // Create a stereo buffer
            const stereoBuffer = ctx.createBuffer(
                2,
                Math.max(buf0.length, buf1.length),
                buf0.sampleRate
            );

            stereoBuffer.copyToChannel(buf0.getChannelData(0), 0);
            stereoBuffer.copyToChannel(buf1.getChannelData(0), 1);

            return stereoBuffer;
        } catch (error) {
            console.error(`Failed to load stereo sound: ${basePath}`, error);
            return null;
        }
    };

    useEffect(() => {
        const initAudio = () => {
            const ctx = getAudioContext();
            if (ctx.state === "suspended") {
                ctx.resume();
            }
        };

        window.addEventListener("click", initAudio, { once: true });
        window.addEventListener("keydown", initAudio, { once: true });

        const preloadSounds = async () => {
            for (const basePath of Object.values(SOUND_BASE_FILES)) {
                if (bufferCacheRef.current.has(basePath)) continue;
                const buffer = await loadStereoBuffer(basePath);
                if (buffer) {
                    bufferCacheRef.current.set(basePath, buffer);
                }
            }
        };

        const timer = setTimeout(preloadSounds, 1000);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("click", initAudio);
            window.removeEventListener("keydown", initAudio);
        };
    }, [getAudioContext]);

    const playSound = useCallback(
        async (type: SoundType) => {
            const ctx = getAudioContext();
            if (ctx.state === "suspended") {
                await ctx.resume();
            }

            const basePath = SOUND_BASE_FILES[type];
            let buffer = bufferCacheRef.current.get(basePath);

            if (!buffer) {
                const loadedBuffer = await loadStereoBuffer(basePath);
                if (loadedBuffer) {
                    bufferCacheRef.current.set(basePath, loadedBuffer);
                    buffer = loadedBuffer;
                }
            }

            if (buffer) {
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(0);
            }
        },
        [getAudioContext]
    );

    return { playSound };
}
