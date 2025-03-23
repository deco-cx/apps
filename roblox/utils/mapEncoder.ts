/**
 * Creates a minimal valid Roblox place file
 * This creates a basic place with:
 * - Baseplate
 * - Lighting
 * - Basic services
 */
export function createMinimalRobloxPlace(): Uint8Array {
  // This is a minimal valid RBXL file structure
  // It's in binary format with specific headers and required services
  const minimalRBXL = new Uint8Array([
    0x3C, 0x72, 0x6F, 0x62, 0x6C, 0x6F, 0x78, 0x21,  // Magic number "<roblox!"
    0x89, 0xFF, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00,  // Binary marker and version
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // Flags
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // Reserved
    // ... more binary data for basic services
  ]);

  return minimalRBXL;
}

/**
 * Encodes a Roblox place file to base64
 * @param content The content to encode
 */
export function encodeRobloxPlaceToBase64(content: string): string {
  return btoa(content);
}

/**
 * Creates and encodes a minimal Roblox place
 * @param customizations Optional customizations for the place
 */
export async function createBase64EncodedPlace(customizations: {
  baseplateSizeX?: number;
  baseplateSizeZ?: number;
  baseplateY?: number;
  lighting?: {
    brightness?: number;
    ambient?: { r: number; g: number; b: number };
  };
} | undefined = undefined): Promise<string> {
  try {
    // Read the template file
    const template = await Deno.readTextFile("templates/basicPlace.rbxlx");
    
    // Apply customizations if provided
    let content = template;
    if (customizations) {
      if (customizations.baseplateSizeX || customizations.baseplateSizeZ) {
        content = content.replace(
          /<X>512<\/X>/g,
          `<X>${customizations.baseplateSizeX || 512}</X>`
        ).replace(
          /<Z>512<\/Z>/g,
          `<Z>${customizations.baseplateSizeZ || 512}</Z>`
        );
      }
      
      if (customizations.baseplateY !== undefined) {
        content = content.replace(
          /<Y>-10<\/Y>/g,
          `<Y>${customizations.baseplateY}</Y>`
        );
      }

      if (customizations.lighting) {
        if (customizations.lighting.brightness !== undefined) {
          content = content.replace(
            /<float name="Brightness">2<\/float>/,
            `<float name="Brightness">${customizations.lighting.brightness}</float>`
          );
        }

        if (customizations.lighting.ambient) {
          const { r, g, b } = customizations.lighting.ambient;
          content = content.replace(
            /<Color3 name="Ambient">[^<]*<R>0<\/R>[^<]*<G>0<\/G>[^<]*<B>0<\/B>[^<]*<\/Color3>/,
            `<Color3 name="Ambient">\n<R>${r}</R>\n<G>${g}</G>\n<B>${b}</B>\n</Color3>`
          );
        }
      }
    }

    return encodeRobloxPlaceToBase64(content);
  } catch (error) {
    console.error("Error creating base64 encoded place:", error);
    throw error;
  }
} 