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
  aspectRatio?: string;
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

export interface SearchAndReplaceOptions {
  searchPrompt: string;
  prompt: string;
}

export interface SearchAndRecolorOptions {
  selectPrompt: string;
  prompt: string;
  growMask?: number;
  negativePrompt?: string;
  seed?: number;
  outputFormat?: "png" | "jpeg" | "webp";
}

export interface ReplaceBackgroundAndRelightOptions {
  backgroundPrompt?: string;
  backgroundReference?: string;
  foregroundPrompt?: string;
  negativePrompt?: string;
  preserveOriginalSubject?: number;
  originalBackgroundDepth?: number;
  keepOriginalBackground?: boolean;
  lightSourceDirection?: "above" | "below" | "left" | "right";
  lightReference?: string;
  lightSourceStrength?: number;
  seed?: number;
  outputFormat?: "png" | "jpeg" | "webp";
}

export interface OutpaintOptions {
  left?: number;
  right?: number;
  up?: number;
  down?: number;
  creativity?: number;
  prompt?: string;
  seed?: number;
  outputFormat?: "png" | "jpeg" | "webp";
}

export interface ControlSketchOptions {
  prompt: string;
  controlStrength?: number;
  negativePrompt?: string;
  seed?: number;
  outputFormat?: "png" | "jpeg" | "webp";
}

export interface ControlStructureOptions {
  prompt: string;
  controlStrength?: number;
  negativePrompt?: string;
  seed?: number;
  outputFormat?: "png" | "jpeg" | "webp";
}

export interface ControlStyleOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: typeof ASPECT_RATIOS[number];
  fidelity?: number;
  seed?: number;
  outputFormat?: "png" | "jpeg" | "webp";
}

// --- Image to Video ---
export interface ImageToVideoOptions {
  seed?: number;
  cfgScale?: number;
  motionBucketId?: number;
}

export interface ImageToVideoStartResponse {
  id: string;
}

export type ImageToVideoResultResponse =
  | { status: "in-progress" }
  | { status: "complete"; video: ArrayBuffer };
// --- End Image to Video ---

export class StabilityAiClient {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.stability.ai";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImageCore(
    prompt: string,
    options?: GenerateImageCoreOptions,
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
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
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
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
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
          },
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
          console.error(
            "Unexpected status response:",
            response.status,
            errorText,
          );
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
    options: UpscaleCreativeOptions,
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
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
      );
    }

    const data = await response.json();
    return { id: data.id };
  }

  async searchAndReplace(
    imageBuffer: Uint8Array,
    options: SearchAndReplaceOptions,
  ): Promise<{ base64Image: string }> {
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]));
    formData.append("output_format", "png");
    formData.append("search_prompt", options.searchPrompt);
    formData.append("prompt", options.prompt);

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/edit/search-and-replace`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
      );
    }

    const data = await response.json();
    return { base64Image: data.image };
  }

  async searchAndRecolor(
    imageBuffer: Uint8Array,
    options: SearchAndRecolorOptions,
  ): Promise<{ base64Image: string }> {
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]));
    formData.append("output_format", "png");
    formData.append("select_prompt", options.selectPrompt);
    formData.append("prompt", options.prompt);

    if (options.growMask !== undefined) {
      formData.append("grow_mask", options.growMask.toString());
    }
    if (options.negativePrompt) {
      formData.append("negative_prompt", options.negativePrompt);
    }
    if (options.seed !== undefined) {
      formData.append("seed", options.seed.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/edit/search-and-recolor`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
      );
    }

    const data = await response.json();
    return { base64Image: data.image };
  }

  async replaceBackgroundAndRelight(
    imageBuffer: Uint8Array,
    options: ReplaceBackgroundAndRelightOptions,
  ): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append("subject_image", new Blob([imageBuffer]));
    formData.append("output_format", "png");

    if (options.backgroundPrompt) {
      formData.append("background_prompt", options.backgroundPrompt);
    }
    if (options.backgroundReference) {
      formData.append(
        "background_reference",
        new Blob([options.backgroundReference]),
      );
    }
    if (options.foregroundPrompt) {
      formData.append("foreground_prompt", options.foregroundPrompt);
    }
    if (options.negativePrompt) {
      formData.append("negative_prompt", options.negativePrompt);
    }
    if (options.preserveOriginalSubject !== undefined) {
      formData.append(
        "preserve_original_subject",
        options.preserveOriginalSubject.toString(),
      );
    }
    if (options.originalBackgroundDepth !== undefined) {
      formData.append(
        "original_background_depth",
        options.originalBackgroundDepth.toString(),
      );
    }
    if (options.keepOriginalBackground !== undefined) {
      formData.append(
        "keep_original_background",
        options.keepOriginalBackground.toString(),
      );
    }
    if (options.lightSourceDirection) {
      formData.append("light_source_direction", options.lightSourceDirection);
    }
    if (options.lightReference) {
      formData.append("light_reference", new Blob([options.lightReference]));
    }
    if (options.lightSourceStrength !== undefined) {
      formData.append(
        "light_source_strength",
        options.lightSourceStrength.toString(),
      );
    }
    if (options.seed !== undefined) {
      formData.append("seed", options.seed.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/edit/replace-background-and-relight`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
      );
    }

    const data = await response.json();
    return { id: data.id };
  }

  async removeBackground(
    imageBuffer: Uint8Array,
  ): Promise<{ base64Image: string }> {
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]));
    formData.append("output_format", "png");

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/edit/remove-background`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
      );
    }

    const data = await response.json();
    return { base64Image: data.image };
  }

  async outpaint(
    imageBuffer: Uint8Array,
    options: OutpaintOptions,
  ): Promise<{ base64Image: string }> {
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]));
    formData.append("output_format", options.outputFormat || "png");

    if (options.left !== undefined) {
      formData.append("left", options.left.toString());
    }
    if (options.right !== undefined) {
      formData.append("right", options.right.toString());
    }
    if (options.up !== undefined) {
      formData.append("up", options.up.toString());
    }
    if (options.down !== undefined) {
      formData.append("down", options.down.toString());
    }
    if (options.creativity !== undefined) {
      formData.append("creativity", options.creativity.toString());
    }
    if (options.prompt) {
      formData.append("prompt", options.prompt);
    }
    if (options.seed !== undefined) {
      formData.append("seed", options.seed.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/edit/outpaint`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
      );
    }

    const data = await response.json();
    return { base64Image: data.image };
  }

  async controlSketch(
    imageBuffer: Uint8Array,
    options: ControlSketchOptions,
  ): Promise<{ base64Image: string }> {
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]));
    formData.append("output_format", options.outputFormat || "png");
    formData.append("prompt", options.prompt);

    if (options.controlStrength !== undefined) {
      formData.append("control_strength", options.controlStrength.toString());
    }
    if (options.negativePrompt) {
      formData.append("negative_prompt", options.negativePrompt);
    }
    if (options.seed !== undefined) {
      formData.append("seed", options.seed.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/control/sketch`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
      );
    }

    const data = await response.json();
    return { base64Image: data.image };
  }

  async controlStructure(
    imageBuffer: Uint8Array,
    options: ControlStructureOptions,
  ): Promise<{ base64Image: string }> {
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]));
    formData.append("output_format", options.outputFormat || "png");
    formData.append("prompt", options.prompt);

    if (options.controlStrength !== undefined) {
      formData.append("control_strength", options.controlStrength.toString());
    }
    if (options.negativePrompt) {
      formData.append("negative_prompt", options.negativePrompt);
    }
    if (options.seed !== undefined) {
      formData.append("seed", options.seed.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/control/structure`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
      );
    }

    const data = await response.json();
    return { base64Image: data.image };
  }

  async controlStyle(
    imageBuffer: Uint8Array,
    options: ControlStyleOptions,
  ): Promise<{ base64Image: string }> {
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]));
    formData.append("output_format", options.outputFormat || "png");
    formData.append("prompt", options.prompt);

    if (options.negativePrompt) {
      formData.append("negative_prompt", options.negativePrompt);
    }
    if (options.aspectRatio) {
      formData.append("aspect_ratio", options.aspectRatio);
    }
    if (options.fidelity !== undefined) {
      formData.append("fidelity", options.fidelity.toString());
    }
    if (options.seed !== undefined) {
      formData.append("seed", options.seed.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/v2beta/stable-image/control/style`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error)}`,
      );
    }

    const data = await response.json();
    return { base64Image: data.image };
  }

  // --- Image to Video Methods ---

  async imageToVideoStart(
    image: Blob,
    options?: ImageToVideoOptions,
  ): Promise<ImageToVideoStartResponse> {
    const formData = new FormData();
    formData.append("image", image);

    if (options?.seed !== undefined) {
      formData.append("seed", options.seed.toString());
    }
    if (options?.cfgScale !== undefined) {
      formData.append("cfg_scale", options.cfgScale.toString());
    }
    if (options?.motionBucketId !== undefined) {
      formData.append("motion_bucket_id", options.motionBucketId.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/v2beta/image-to-video`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json", // Expecting JSON response with ID
        },
        body: formData,
      },
    );

    if (!response.ok) {
      let errorDetails = "Unknown error";
      try {
        // Try parsing JSON error first
        const errorJson = await response.json();
        errorDetails = JSON.stringify(errorJson);
      } catch (_e) {
        // Fallback to text if JSON parsing fails
        errorDetails = await response.text();
      }
      throw new Error(
        `API error (${response.status}): ${errorDetails}`,
      );
    }

    const data = await response.json();
    return { id: data.id };
  }

  async imageToVideoResult(
    id: string,
    options?: { accept?: "video/*" | "application/json" },
  ): Promise<ImageToVideoResultResponse | { status: "error"; error: string }> {
    const acceptHeader = options?.accept ?? "video/*"; // Default to video/*

    const response = await fetch(
      `${this.baseUrl}/v2beta/image-to-video/result/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: acceptHeader,
        },
      },
    );

    if (response.status === 202) {
      return { status: "in-progress" };
    }

    if (response.status === 200) {
      if (acceptHeader === "video/*") {
        const videoArrayBuffer = await response.arrayBuffer();
        return { status: "complete", video: videoArrayBuffer };
      } else {
        // Handle JSON response if needed (though the API doc primarily shows video/*)
        // For now, we expect video/* but keep this structure flexible
        console.warn(
          "Received JSON response for video result, but expected video/*. Handling as error.",
        );
        const errorJson = await response.json();
        return { status: "error", error: JSON.stringify(errorJson) };
      }
    }

    // Handle other error statuses
    let errorDetails = "Unknown error";
    try {
      const errorJson = await response.json();
      errorDetails = JSON.stringify(errorJson);
    } catch (_e) {
      errorDetails = await response.text();
    }
    console.error(`API error (${response.status}): ${errorDetails}`);
    return {
      status: "error",
      error: `API error (${response.status}): ${errorDetails}`,
    };
  }

  // --- End Image to Video Methods ---
}
