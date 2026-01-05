export interface Game {
    id: number;
    name: string;
    slug: string;
    background_image: string | null;
    released: string | null;
    rating: number;
    metacritic: number | null;
    playtime: number;
    genres: { id: number; name: string }[];
    platforms: { platform: { id: number; name: string } }[];
    short_screenshots: { id: number; image: string }[];
}

export interface GamesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Game[];
}

export async function fetchPlayStationGames(
    page = 1,
    pageSize = 15
): Promise<GamesResponse> {
    const response = await fetch("/games.json");
    if (!response.ok) {
        throw new Error("Failed to fetch games");
    }
    const data: GamesResponse = await response.json();

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const results = data.results.slice(start, end);

    return {
        ...data,
        results,
    };
}

export async function searchGames(
    query: string,
    page = 1
): Promise<GamesResponse> {
    const response = await fetch("/games.json");
    if (!response.ok) {
        throw new Error("Failed to search games");
    }
    const data: GamesResponse = await response.json();

    const filtered = data.results.filter((game) =>
        game.name.toLowerCase().includes(query.toLowerCase())
    );

    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
        ...data,
        count: filtered.length,
        results: filtered.slice(start, end),
    };
}

export async function fetchGameDetails(id: number): Promise<Game> {
    const response = await fetch("/games.json");
    if (!response.ok) {
        throw new Error("Failed to fetch game details");
    }
    const data: GamesResponse = await response.json();

    const game = data.results.find((g) => g.id === id);
    if (!game) {
        throw new Error("Game not found");
    }
    return game;
}
