import { useState, useEffect, useCallback, useRef } from "react";
import useSWR from "swr";
import { XMBIcon } from "./xmb-icon";
import { GameThumbnail } from "./game-thumbnail";
import { useGamepad } from "@/hooks/use-gamepad";
import { useXMBSounds } from "@/hooks/use-xmb-sounds";
import { fetchPlayStationGames, type Game } from "@/lib/rawg-api";
import { cn } from "@/lib/utils";

interface SubItem {
    id: string;
    label: string;
    icon?: string;
    description?: string;
    image?: string | null;
    rating?: number;
    metacritic?: number | null;
}

interface Category {
    id: string;
    label: string;
    icon: string;
    items: SubItem[];
    isDynamic?: boolean;
}

const staticCategories: Category[] = [
    {
        id: "users",
        label: "Users",
        icon: "users",
        items: [
            { id: "poweroff", label: "Turn Off System", icon: "poweroff" },
            {
                id: "user-create",
                label: "Create New User",
                icon: "user-create",
            },
            { id: "user1", label: "Player 1", icon: "user-login" },
        ],
    },
    {
        id: "settings",
        label: "Settings",
        icon: "settings",
        items: [
            { id: "update", label: "System Update", icon: "update" },
            {
                id: "game-settings",
                label: "Game Settings",
                icon: "game-settings",
            },
            {
                id: "video-settings",
                label: "Video Settings",
                icon: "video-settings",
            },
            {
                id: "music-settings",
                label: "Music Settings",
                icon: "music-settings",
            },
            {
                id: "chat-settings",
                label: "Chat Settings",
                icon: "chat-settings",
            },
            {
                id: "system-settings",
                label: "System Settings",
                icon: "system-settings",
            },
            {
                id: "theme-settings",
                label: "Theme Settings",
                icon: "theme-settings",
            },
            {
                id: "accessory-settings",
                label: "Accessory Settings",
                icon: "accessory-settings",
            },
            {
                id: "display-settings",
                label: "Display Settings",
                icon: "display-settings",
            },
            {
                id: "sound-settings",
                label: "Sound Settings",
                icon: "sound-settings",
            },
            {
                id: "security-settings",
                label: "Security Settings",
                icon: "security-settings",
            },
            {
                id: "remote-settings",
                label: "Remote Play Settings",
                icon: "remote-settings",
            },
            {
                id: "network-settings",
                label: "Network Settings",
                icon: "network-settings",
            },
        ],
    },
    {
        id: "photo",
        label: "Photo",
        icon: "photo",
        items: [
            { id: "photo-gallery", label: "Photo Gallery", icon: "gallery" },
        ],
    },
    {
        id: "music",
        label: "Music",
        icon: "music",
        items: [{ id: "music-hdd", label: "All Music", icon: "plain-folder" }],
    },
    {
        id: "video",
        label: "Video",
        icon: "video",
        items: [{ id: "video-hdd", label: "All Video", icon: "video-folder" }],
    },
    {
        id: "tv",
        label: "TV/Video Services",
        icon: "tv",
        items: [
            { id: "netflix", label: "Netflix", icon: "tv" },
            { id: "youtube", label: "YouTube", icon: "tv" },
        ],
    },
    {
        id: "game",
        label: "Game",
        icon: "game",
        items: [
            { id: "game-data", label: "Game Data Utility", icon: "game-data" },
            {
                id: "mc-utility",
                label: "Memory Card Utility (PS/PS2)",
                icon: "mc-utility",
            },
            {
                id: "sd-utility",
                label: "Saved Data Utility (PS3)",
                icon: "sd-utility",
            },
            { id: "trophies", label: "Trophy Collection", icon: "trophies" },
        ],
        isDynamic: true,
    },
    {
        id: "network",
        label: "Network",
        icon: "network",
        items: [
            {
                id: "manuals",
                label: "Online Instruction Manuals",
                icon: "manuals",
            },
            { id: "remote-play", label: "Remote Play", icon: "remote-play" },
            { id: "browser", label: "Internet Browser", icon: "browser" },
            { id: "search", label: "Internet Search", icon: "search" },
            {
                id: "download-mgmt",
                label: "Download Management",
                icon: "download-mgmt",
            },
        ],
    },
    {
        id: "psn",
        label: "PlayStation Network",
        icon: "psn",
        items: [{ id: "store", label: "PlayStation Store", icon: "store" }],
    },
    {
        id: "friends",
        label: "Friends",
        icon: "friends",
        items: [
            { id: "add-friend", label: "Add a Friend", icon: "add-friend" },
            { id: "players-met", label: "Players Met", icon: "players-met" },
            { id: "message-box", label: "Message Box", icon: "message-box" },
        ],
    },
];

export function XMBMenu({ disabled = false }: { disabled?: boolean }) {
    const [menuState, setMenuState] = useState({
        category: 6,
        item: 0,
        isVertical: true,
    });
    const [hasPlayedStartup, setHasPlayedStartup] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { playSound } = useXMBSounds();

    const { data: gamesData, isLoading } = useSWR(
        "playstation-games",
        () => fetchPlayStationGames(1, 15),
        {
            revalidateOnFocus: false,
        }
    );

    const categories: Category[] = staticCategories.map((cat) => {
        if (cat.id === "game" && gamesData?.results) {
            return {
                ...cat,
                items: [
                    ...cat.items,
                    ...gamesData.results.map((game: Game) => ({
                        id: String(game.id),
                        label: game.name,
                        icon: "game",
                        description:
                            game.genres
                                ?.slice(0, 2)
                                .map((g) => g.name)
                                .join(", ") || "Game",
                        image: game.background_image,
                        rating: game.rating,
                        metacritic: game.metacritic,
                    })),
                ],
            };
        }
        return cat;
    });

    useEffect(() => {
        if (!hasPlayedStartup) {
            const timer = setTimeout(() => {
                playSound("startup");
                setHasPlayedStartup(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [hasPlayedStartup, playSound]);

    const navigateLeft = useCallback(() => {
        if (disabled) return;
        setMenuState((prev) => {
            if (prev.category > 0) {
                playSound("category");
                return {
                    ...prev,
                    category: prev.category - 1,
                    item: 0,
                    isVertical: true,
                };
            }
            return prev;
        });
    }, [playSound, disabled]);

    const navigateRight = useCallback(() => {
        if (disabled) return;
        setMenuState((prev) => {
            if (prev.category < categories.length - 1) {
                playSound("category");
                return {
                    ...prev,
                    category: prev.category + 1,
                    item: 0,
                    isVertical: true,
                };
            }
            return prev;
        });
    }, [categories.length, playSound, disabled]);

    const navigateUp = useCallback(() => {
        if (disabled) return;
        setMenuState((prev) => {
            if (prev.isVertical && prev.item > 0) {
                playSound("navigate");
                return { ...prev, item: prev.item - 1 };
            } else if (prev.isVertical && prev.item === 0) {
                playSound("back");
                return { ...prev, isVertical: false };
            }
            return prev;
        });
    }, [playSound, disabled]);

    const navigateDown = useCallback(() => {
        if (disabled) return;
        setMenuState((prev) => {
            const currentCategory = categories[prev.category];
            if (!prev.isVertical && currentCategory.items.length > 0) {
                playSound("navigate");
                return { ...prev, isVertical: true, item: 0 };
            } else if (
                prev.isVertical &&
                prev.item < currentCategory.items.length - 1
            ) {
                playSound("navigate");
                return { ...prev, item: prev.item + 1 };
            }
            return prev;
        });
    }, [categories, playSound, disabled]);

    const handleSelect = useCallback(() => {
        if (disabled) return;
        playSound("select");
    }, [playSound, disabled]);

    const handleBack = useCallback(() => {
        if (disabled) return;
        setMenuState((prev) => {
            if (prev.isVertical) {
                playSound("back");
                return { ...prev, isVertical: false, item: 0 };
            }
            return prev;
        });
    }, [playSound, disabled]);

    useGamepad({
        onLeft: navigateLeft,
        onRight: navigateRight,
        onUp: navigateUp,
        onDown: navigateDown,
        onCross: handleSelect,
        onCircle: handleBack,
        onL1: navigateLeft,
        onR1: navigateRight,
    });

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":
                    navigateLeft();
                    break;
                case "ArrowRight":
                    navigateRight();
                    break;
                case "ArrowUp":
                    navigateUp();
                    break;
                case "ArrowDown":
                    navigateDown();
                    break;
                case "Enter":
                    handleSelect();
                    break;
                case "Escape":
                case "Backspace":
                    handleBack();
                    break;
            }
        },
        [
            navigateLeft,
            navigateRight,
            navigateUp,
            navigateDown,
            handleSelect,
            handleBack,
        ]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const {
        category: selectedCategory,
        item: selectedItem,
        isVertical: isNavigatingVertically,
    } = menuState;

    const currentCategory = categories[selectedCategory];
    // Clamp selection just in case categories change dynamically
    const clampedSelectedItem = Math.min(
        selectedItem,
        Math.max(0, currentCategory.items.length - 1)
    );
    const currentItem = currentCategory.items[clampedSelectedItem];
    const isGameCategory = currentCategory.id === "game";

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden select-none"
        >
            {/* Game Preview Background */}
            {isGameCategory && currentItem?.image && (
                <div
                    className="absolute inset-0 transition-opacity duration-700 opacity-20"
                    style={{
                        backgroundImage: `url(${currentItem.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(30px)",
                    }}
                />
            )}

            {/* Main XMB Layout */}
            <div className="absolute inset-0" style={{ top: "20%" }}>
                {/* Horizontal Category Menu */}
                <div className="relative h-20 w-full overflow-visible z-20">
                    <div
                        className="absolute left-[20%] flex items-center transition-transform duration-300 ease-out"
                        style={{
                            transform: `translateX(calc(-${
                                selectedCategory * 160
                            }px - 40px))`,
                            gap: "80px",
                        }}
                    >
                        {categories.map((category, index) => {
                            const isSelected = index === selectedCategory;
                            const distance = Math.abs(index - selectedCategory);

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        if (index !== selectedCategory) {
                                            playSound("category");
                                            setMenuState({
                                                category: index,
                                                item: 0,
                                                isVertical: true,
                                            });
                                        }
                                    }}
                                    className="relative flex flex-col items-center transition-all duration-300 ease-out w-20"
                                    style={{
                                        opacity:
                                            distance === 0
                                                ? 1
                                                : distance === 1
                                                ? 0.8
                                                : distance === 2
                                                ? 0.6
                                                : 0.5,
                                    }}
                                >
                                    <XMBIcon
                                        name={category.icon}
                                        size={80}
                                        variant="category"
                                    />
                                    {isSelected && (
                                        <span className="absolute top-[calc(100%+1rem)] text-base font-light text-white/90 tracking-wide whitespace-nowrap">
                                            {category.label}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Vertical Menu Items */}
                <div
                    key={selectedCategory}
                    className="absolute left-0 right-0 top-0 overflow-visible transition-transform duration-300 ease-out"
                    style={{
                        transform: `translateY(${
                            -clampedSelectedItem * 64 - 40
                        }px)`,
                    }}
                >
                    <div
                        className="absolute left-[20%] top-0 flex flex-col items-start"
                        style={{
                            transform: `translateX(-40px)`,
                        }}
                    >
                        {currentCategory.items.length === 0 ? (
                            <div
                                className="text-white/40 text-sm ml-24"
                                style={{ marginTop: 200 }}
                            >
                                {isLoading ? "Loading..." : "No items"}
                            </div>
                        ) : (
                            currentCategory.items.map((item, index) => {
                                const isSelected =
                                    index === clampedSelectedItem;
                                const gap = 200; // Gap for the horizontal category bar

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (index !== clampedSelectedItem) {
                                                playSound("navigate");
                                            }
                                            setMenuState((prev) => ({
                                                ...prev,
                                                item: index,
                                                isVertical: true,
                                            }));
                                        }}
                                        onDoubleClick={handleSelect}
                                        className={cn(
                                            "flex items-center gap-6 text-left transition-all duration-300 h-16",
                                            !isNavigatingVertically &&
                                                "opacity-70"
                                        )}
                                        style={{
                                            marginLeft: isSelected ? 0 : 20,
                                            marginTop: isSelected ? gap : 0,
                                            opacity:
                                                Math.abs(
                                                    index - clampedSelectedItem
                                                ) > 8
                                                    ? 0
                                                    : undefined,
                                        }}
                                    >
                                        {item.image !== undefined ? (
                                            <GameThumbnail
                                                src={item.image}
                                                alt={item.label}
                                                width={isSelected ? 80 : 56}
                                                height={isSelected ? 56 : 40}
                                                isSelected={isSelected}
                                                className="transition-all duration-300"
                                            />
                                        ) : (
                                            <XMBIcon
                                                name={
                                                    item.icon ||
                                                    currentCategory.icon
                                                }
                                                size={isSelected ? 80 : 56}
                                                variant="item"
                                                className="transition-all duration-300"
                                            />
                                        )}

                                        <span
                                            className={cn(
                                                "transition-all duration-300 whitespace-nowrap leading-none pt-1",
                                                isSelected
                                                    ? "text-2xl text-white font-normal"
                                                    : "text-lg text-white/70 font-light"
                                            )}
                                            style={
                                                isSelected &&
                                                isNavigatingVertically
                                                    ? {
                                                          animation:
                                                              "glow-pulse 2s ease-in-out infinite",
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Clock - Top Right */}
            <Clock />
        </div>
    );
}

function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute top-6 right-8 text-right text-white/60">
            <p className="text-xl font-light tabular-nums tracking-wide">
                {time.getDate()}/{time.getMonth() + 1} {time.getHours()}:
                {time.getMinutes().toString().padStart(2, "0")}
            </p>
        </div>
    );
}
