import { AppContext } from "../mod.ts";
import { createBase64EncodedPlace } from "../utils/mapEncoder.ts";

interface RobloxDeployResponse {
  success: boolean;
  data?: {
    placeId: string;
    versionNumber: number;
    createdTimestamp: string;
  };
  error?: string;
}

interface RobloxDeployProps {
  placeId: string;
  mapBase64Encoded: string;
  versionType?: 'Published' | 'Saved';
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
 * @name deploy_roblox_map
 * @description Deploys a map to Roblox
 * Requires the following environment variables:
 * - ROBLOX_API_KEY: Your Roblox Developer API key
 * - ROBLOX_COOKIE: Your .ROBLOSECURITY cookie value
 */
export default async function deployRobloxMap({
  placeId,
  mapBase64Encoded,
  versionType = 'Published'
}: RobloxDeployProps, _req: Request, ctx: AppContext): Promise<RobloxDeployResponse> {
  mapBase64Encoded ??= await createBase64EncodedPlace();
  try {
    const apiKey = ctx.robloxApiKey.get();
    const cookie = ctx.robloxCookie.get();

    if (!apiKey || !cookie) {
      throw new Error("Missing required Roblox credentials in environment variables");
    }

    // Get CSRF token
    const csrfToken = await getRobloxCsrfToken(cookie);
    if (!csrfToken) {
      throw new Error("Failed to get CSRF token");
    }

    // First, get the universe ID for this place
    const universeResponse = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`, {
      headers: {
        'Cookie': `.ROBLOSECURITY=${cookie}`,
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
    });

    if (!universeResponse.ok) {
      const errorData = await universeResponse.json();
      throw new Error(`Failed to get universe ID: ${errorData.message || universeResponse.statusText}`);
    }

    const { universeId } = await universeResponse.json();

    // Decode base64 string to binary data
    const binaryString = atob(mapBase64Encoded);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create form data for the upload
    const formData = new FormData();
    formData.append("file", new Blob([bytes], { type: "application/octet-stream" }), "map.rbxlx");

    // Add version type as a query parameter instead of form data
    const queryParams = new URLSearchParams({
      versionType: versionType
    });

    // Upload to Roblox using the universe endpoint
    const response = await fetch(
      `https://apis.roblox.com/universes/v1/${universeId}/places/${placeId}/versions?${queryParams}`,
      {
        method: "POST",
        headers: {
          'Cookie': `.ROBLOSECURITY=${cookie}`,
          'X-CSRF-TOKEN': csrfToken,
          'x-api-key': apiKey,
          'Accept': 'application/json',
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('Full error response:', errorData);
      throw new Error(`Roblox API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        placeId: data.placeId,
        versionNumber: data.versionNumber,
        createdTimestamp: data.created,
      },
    };
  } catch (error) {
    console.error("Deployment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}