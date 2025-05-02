import type { AudioModelV1, SharedVoicesOptions } from "./audio-provider.ts";

/**
 * The payload for audio generation requests.
 */
export interface AudioPayload {
  /**
   * The text to generate audio from.
   * Note: Only applicable for text‐based audio generation models (not for audio transformation).
   */
  prompt?: string;
  /**
   * Audio content as base64 string.
   * Used for audio‐processing models like voice‐conversion, STT, etc.
   */
  audio?: string;
  /**
   * The AudioModelV1 to generate or transform audio with.
   */
  model: AudioModelV1;
  /**
   * Headers to be included in the request.
   */
  headers?: Record<string, string>;
  /**
   * Provider‐specific options. For ElevenLabs, this may include:
   * voiceId: string — The voice ID to apply to the text
   * model_id: string — The TTS model to generate with
   * voice_settings: object — Stability and other voice settings
   * and other parameters specific to different endpoints.
   *
   * For "shared-voices" endpoint, the sharedVoices object should be used.
   */
  providerOptions?: {
    elevenLabs?: {
      voiceId?: string;
      model_id?: string;
      voice_settings?: {
        stability?: number;
        similarity_boost?: number;
        style?: number;
        use_speaker_boost?: boolean;
      };
      remove_background_noise?: boolean;
      seed?: number;
      fileUrls?: string[];
      name?: string;
      description?: string;
      labels?: string;
      language_code?: string;
      filename?: string;
      tag_audio_events?: boolean;
      num_speakers?: number;
      timestamps_granularity?: string;
      diarize?: boolean;
      isolation_type?: string;
      duration_seconds?: number;
      prompt_influence?: number;
      sharedVoices?: SharedVoicesOptions;
    };
  };
}

/**
 * The response from audio generation requests.
 */
export interface AudioResponse {
  /**
   * The generated audio as a base64 string.
   * Present in responses from most audio generation models.
   */
  audio?: string;
  /**
   * Multiple generated audio files, when an endpoint returns choices.
   */
  audios?: string[];
  /**
   * Any response‐specific data fields.
   */
  [key: string]: unknown;
}
