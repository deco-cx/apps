/**
 * FLUX.1 Kontext API types and interfaces
 */

export interface FluxImageGenerationRequest {
  /** Text description of the desired image */
  prompt: string;

  /** Desired aspect ratio (e.g., "16:9"). All outputs are ~1MP total. Supports ratios from 3:7 to 7:3. */
  aspect_ratio?: string;

  /** Seed for reproducibility. If null or omitted, a random seed is used. */
  seed?: number | null;

  /** If true, performs upsampling on the prompt. Advised for T2I only currently. */
  prompt_upsampling?: boolean;

  /** Moderation level for inputs and outputs. Value ranges from 0 (most strict) to 2 (least strict). */
  safety_tolerance?: number;

  /** Desired format of the output image. Can be "jpeg" or "png". */
  output_format?: "jpeg" | "png";

  /** URL for asynchronous completion notification. Must be a valid HTTP/HTTPS URL. */
  webhook_url?: string | null;

  /** Secret for webhook signature verification, sent in the X-Webhook-Secret header. */
  webhook_secret?: string | null;
}

export interface FluxImageGenerationResponse {
  /** Unique identifier for the request */
  id: string;
}

export interface FluxResultResponse {
  /** Status of the request */
  status: "Queued" | "Processing" | "Ready" | "Error";

  /** Result data when status is "Ready" */
  result?: {
    /** Signed URL for image retrieval (valid for 10 minutes) */
    sample: string;
  };

  /** Error message if status is "Error" */
  error?: string;
}
