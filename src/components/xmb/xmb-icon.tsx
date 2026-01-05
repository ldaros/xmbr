import { cn, withBase } from "@/lib/utils";

const ps3IconMap: Record<string, string> = {
    // Categories
    users: "item_tex_Players.png",
    settings: "tex_sett.png",
    photo: "tex_photo.png",
    music: "tex_music.png",
    video: "tex_video.png",
    tv: "tex_display.png",
    game: "tex_game.png",
    network: "tex_network.png",
    psn: "item_tex_ps_store.png",
    friends: "item_tex_Players.png",

    // Users
    poweroff: "tex_power_off.png",
    "user-create": "item_tex_NewUser.png",
    "user-login": "user_tex_login.png",

    // Settings
    update: "tex_update.png",
    "game-settings": "tex_game.png",
    "video-settings": "tex_bddvd.png",
    "music-settings": "tex_music.png",
    "chat-settings": "tex_chat.png",
    "system-settings": "tex_console.png",
    "theme-settings": "tex_thema.png",
    "accessory-settings": "tex_pd.png",
    "display-settings": "tex_display.png",
    "sound-settings": "tex_sound.png",
    "security-settings": "tex_security.png",
    "remote-settings": "tex_remote.png",
    "network-settings": "tex_network.png",

    // Photo/Music/Video
    gallery: "photo_tex_album_default.png",
    "video-folder": "video_tex_album_default.png",
    "plain-folder": "item_tex_plain_folder.png",

    // Game Utility
    "game-data": "item_tex_ps3util.png",
    "mc-utility": "item_tex_ps12util.png",
    "sd-utility": "item_tex_ps3sd_folder.png",
    trophies: "item_tex_trophy.png",

    // Network
    manuals: "tex_onlinemanual.png",
    "remote-play": "tex_premo.png",
    browser: "tex_browser.png",
    search: "tex_kensaku.png",
    "download-mgmt": "tex_dl_manage.png",

    // PSN
    store: "item_tex_ps_store.png",

    // Friends
    "sign-in": "tex_Sign_In.png",
    "add-friend": "item_tex_NewFriend.png",
    "players-met": "item_tex_Players.png",
    "message-box": "item_tex_Messages.png",
};

// Fallback for missing keys
const DEFAULT_ICON = "tex_unknown_icon.png";

interface XMBIconProps {
    name: string;
    size?: number;
    className?: string;
    variant?: "category" | "item";
}

export function XMBIcon({
    name,
    size = 48,
    className = "",
    variant = "category",
}: XMBIconProps) {
    // Handle special cases or defaults
    let filename = ps3IconMap[name];

    if (!filename) {
        filename = DEFAULT_ICON;
    }

    const iconSrc = withBase(`/ps3/${filename}`);

    if (variant === "item") {
        return (
            <div
                className={cn(
                    "flex items-center justify-center rounded-full",
                    className
                )}
                style={{ width: size, height: size }}
            >
                <img
                    src={iconSrc}
                    alt={name}
                    className="w-full h-full object-contain opacity-90"
                    style={{
                        filter: "brightness(1.1)",
                    }}
                />
            </div>
        );
    }

    // Category icon
    return (
        <div
            className={cn("flex items-center justify-center", className)}
            style={{ width: size, height: size }}
        >
            <img
                src={iconSrc}
                alt={name}
                className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] transition-transform duration-300"
            />
        </div>
    );
}
