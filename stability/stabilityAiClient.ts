// Constants for shared values
export const ASPECT_RATIOS = [
  "16:9",
  "1:1",
  "21:9",
  "2:3",
  "3:2",
  "4:5",
  "5:4",
  "9:16",
  "9:21",
] as const;

export const STYLE_PRESETS = [
  "3d-model",
  "analog-film",
  "anime",
  "cinematic",
  "comic-book",
  "digital-art",
  "enhance",
  "fantasy-art",
  "isometric",
  "line-art",
  "low-poly",
  "modeling-compound",
  "neon-punk",
  "origami",
  "photographic",
  "pixel-art",
  "tile-texture",
] as const;

export interface GenerateImageCoreOptions {
  aspectRatio?: typeof ASPECT_RATIOS[number];
  negativePrompt?: string;
  seed?: number;
  stylePreset?: typeof STYLE_PRESETS[number];
  outputFormat?: "png" | "jpeg" | "webp";
}

export interface UpscaleCreativeOptions {
  prompt: string;
  negativePrompt?: string;
  creativity?: number;
}

export class StabilityAiClient {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.stability.ai";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImageCore(
    prompt: string,
    options?: GenerateImageCoreOptions
  ): Promise<{ base64Image: string }> {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("output_format", "png");

    if (options?.aspectRatio) {
      formData.append("aspect_ratio", options.aspectRatio);
    }
    if (options?.negativePrompt) {
      formData.append("negative_prompt", options.negativePrompt);
    }
    if (options?.stylePreset) {
      formData.append("style_preset", options.stylePreset);
    }
    if (options?.seed !== undefined) {
      formData.append("seed", options.seed.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/generate/core`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`
      );
    }

    const data = await response.json();
    return { base64Image: data.image };
  }

  async upscaleFast(imageBuffer: Uint8Array): Promise<{ base64Image: string }> {
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]));
    formData.append("output_format", "png");

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/upscale/fast`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`
      );
    }

    const data = await response.json();
    return { base64Image: data.image };
  }

  async fetchGenerationResult(id: string): Promise<{ base64Image: string }> {
    try {
      console.log("Polling for generation result, ID:", id);
      while (true) {
        const response = await fetch(
          `${this.baseUrl}/v2beta/results/${id}`,
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              Accept: "application/json",
            },
          }
        );

        console.log("Poll response status:", response.status);
        if (response.status === 200) {
          const data = await response.json();
          console.log("Received successful result");
          return { base64Image: data.result };
        } else if (response.status === 202) {
          console.log("Generation still in progress, waiting 10 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 10000));
        } else {
          const errorText = await response.text();
          console.error("Unexpected status response:", response.status, errorText);
          throw new Error(`Unexpected status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Error in fetchGenerationResult:", error);
      if (error instanceof Error) {
        throw new Error(`API error: ${error.message}`);
      }
      throw error;
    }
  }

  async upscaleCreative(
    imageBuffer: Uint8Array,
    options: UpscaleCreativeOptions
  ): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]));
    formData.append("output_format", "png");
    formData.append("prompt", options.prompt);

    if (options.negativePrompt) {
      formData.append("negative_prompt", options.negativePrompt);
    }
    if (options.creativity !== undefined) {
      formData.append("creativity", options.creativity.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/upscale/creative`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`
      );
    }

    const data = await response.json();
    return { id: data.id };
  }
} 