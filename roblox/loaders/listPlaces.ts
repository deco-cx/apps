import { AppContext } from "../mod.ts";

interface RobloxPlace {
  id: string;
  universeId: string;
  name: string;
  description: string;
  created: string;
  updated: string;
  placeVisits: number;
}

interface ListPlacesResponse {
  success: boolean;
  data?: RobloxPlace[];
  error?: string;
}

/**
 * Gets CSRF token for Roblox API requests
 */
async function getRobloxCsrfToken(cookie: string): Promise<string> {
  const response = await fetch('https://auth.roblox.com/v2/logout', {
    method: 'POST',
    headers: {
      'Cookie': `.ROBLOSECURITY=${cookie}`,
    },
  });
  return response.headers.get('x-csrf-token') || '';
}

/**
 * @name list_roblox_places
 * @description Lists all Roblox places owned by the authenticated user
 */
export default async function listRobloxPlaces(_props: unknown, _req: Request, ctx: AppContext): Promise<ListPlacesResponse> {
  try {
    const cookie = ctx.robloxCookie.get();
    if (!cookie) {
      throw new Error("Missing ROBLOX_COOKIE variable");
    }

    // Get CSRF token
    const csrfToken = await getRobloxCsrfToken(cookie);
    if (!csrfToken) {
      throw new Error("Failed to get CSRF token");
    }

    // First, get the authenticated user's ID
    const userResponse = await fetch("https://users.roblox.com/v1/users/authenticated", {
      headers: {
        'Cookie': `.ROBLOSECURITY=${cookie}`,
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to authenticate with Roblox");
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Get user's universes (games)
    const universesResponse = await fetch(`https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50&sortOrder=Asc`, {
      headers: {
        'Cookie': `.ROBLOSECURITY=${cookie}`,
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
    });

    if (!universesResponse.ok) {
      const errorData = await universesResponse.json().catch(() => ({ message: universesResponse.statusText }));
      throw new Error(`Failed to fetch user's games: ${errorData.message || universesResponse.statusText}`);
    }

    const universesData = await universesResponse.json();

    // Transform the response into our format
    // deno-lint-ignore no-explicit-any
    const places = universesData.data.map((game: any) => ({
      id: game.rootPlace.id.toString(),
      universeId: game.id.toString(),
      name: game.name,
      description: game.description,
      created: game.created,
      updated: game.updated,
      placeVisits: game.placeVisits,
    }));

    return {
      success: true,
      data: places,
    };

  } catch (error) {
    console.error("Error listing places:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
} 