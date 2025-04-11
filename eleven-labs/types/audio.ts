/**
 * The payload for audio generation requests.
 */
export interface AudioPayload {
  /** The model to use for generation */
  model: string;
  /** The text prompt to generate audio from */
  prompt?: string;
  /** Base64 encoded audio input for voice changing/audio processing */
  audio?: string;
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
  /** Provider-specific options */
  providerOptions?: {
    elevenLabs?: {
      /** The voice ID to use for text-to-speech */
      voiceId?: string;
      /** The model ID to use */
      model_id?: string;
      /** Whether to remove background noise */
      remove_background_noise?: boolean;
      /** Random seed for reproducibility */
      seed?: number;
      /** Voice settings as a JSON object */
      voice_settings?: Record<string, unknown>;
      /** Any other ElevenLabs-specific options */
      [key: string]: unknown;
    };
  };
}

/**
 * The response from audio generation requests.
 */
export interface AudioResponse {
  /** Base64 encoded audio output */
  audio?: string;
  /** Array of base64 encoded audio outputs (for multi-audio responses) */
  audios?: string[];
  /** Voice ID for voice cloning */
  voice_id?: string;
  /** Whether voice requires verification */
  requires_verification?: boolean;
} 