import type {
  AudioModelV1,
  SharedVoicesOptions,
  SharedVoicesResponse,
} from "./types/audio-provider.ts";
import type { AudioPayload, AudioResponse } from "./types/audio.ts";
import { base64ToFile, bufferToBase64 } from "./utils.ts";

// Define the structure for the speech-to-text response within this file
// (Alternatively, could be moved to types/audio.ts if preferred)
interface SpeechToTextResponse {
  language_code: string;
  language_probability: number;
  text: string;
  words: {
    text: string;
    type: "word" | "spacing";
    start: number;
    end: number;
    speaker_id: string;
    characters?: {
      text: string;
      start: number;
      end: number;
    }[];
  }[];
  additional_formats?: {
    requested_format: string;
    file_extension: string;
    content_type: string;
    is_base64_encoded: boolean;
    content: string;
  }[];
}

interface ElevenLabsAudioConfig {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string | undefined>;
  fetch?: typeof fetch;
}

/**
 * A single "AudioModelV1" class that can handle multiple Eleven Labs endpoints,
 * depending on the `modelId` we pass in: "tts", "tts-timestamps", "voice-changer",
 * "sound-effects", "audio-isolation", "text-to-voice", etc.
 */
export class ElevenLabsAudioModel implements AudioModelV1 {
  readonly specificationVersion = "v1";
  readonly modelId: string;
  private readonly config: ElevenLabsAudioConfig;

  get provider(): string {
    return this.config.provider;
  }

  constructor(modelId: string, config: ElevenLabsAudioConfig) {
    this.modelId = modelId;
    this.config = config;
  }

  /**
   * The main entry point. We switch on the `modelId` to decide which
   * ElevenLabs endpoint to call.
   * Note: Using Promise<any> to accommodate different response types (AudioResponse vs SpeechToTextResponse)
   * without modifying the base AudioModelV1 interface for now.
   */
  async doGenerate(
    options: Omit<AudioPayload, "model">,
  ): // deno-lint-ignore no-explicit-any
  Promise<any> { // Use any to bypass strict type checking for now
    switch (this.modelId) {
      case "tts":
        return await this.textToSpeech(options);
      case "tts-timestamps":
        return await this.textToSpeechWithTimestamps(options);
      case "voice-changer":
        return await this.voiceChanger(options);
      case "sound-effects":
        return await this.textToSoundEffects(options);
      case "audio-isolation":
        return await this.audioIsolation(options);
      case "text-to-voice":
        return await this.textToVoice(options);
      case "voice-clone":
        return await this.createVoiceClone(options);
      case "speech-to-text":
        return await this.speechToText(options);
      case "shared-voices":
        return await this.getSharedVoices(options);
      default:
        throw new Error(`Unsupported ElevenLabs modelId: ${this.modelId}`);
    }
  }

  /**
   * (1) Text‐to‐Speech
   * POST /v1/text-to-speech/:voice_id
   */
  private async textToSpeech(options: Omit<AudioPayload, "model">) {
    const voiceId = this.getVoiceId(options);
    const endpoint = `/v1/text-to-speech/${voiceId}`;
    const body: Record<string, unknown> = {
      text: options.prompt ?? "",
      ...this.extractElevenLabsBody(options),
    };

    return await this.sendJsonAndReturnAudio(endpoint, body, options);
  }

  /**
   * (2) Text‐to‐Speech with Timing
   * POST /v1/text-to-speech/:voice_id/with-timestamps
   */
  private async textToSpeechWithTimestamps(
    options: Omit<AudioPayload, "model">,
  ) {
    const voiceId = this.getVoiceId(options);
    const endpoint = `/v1/text-to-speech/${voiceId}/with-timestamps`;
    const body: Record<string, unknown> = {
      text: options.prompt ?? "",
      ...this.extractElevenLabsBody(options),
    };

    return await this.sendJsonAndReturnAudio(endpoint, body, options);
  }

  /**
   * (3) Voice Changer
   * POST /v1/speech-to-speech/:voice_id
   */
  private async voiceChanger(options: Omit<AudioPayload, "model">) {
    const voiceId = this.getVoiceId(options);
    const endpoint = `/v1/speech-to-speech/${voiceId}`;
    const form = new FormData();

    if (!options.audio) {
      throw new Error(
        "voice-changer requires an `audio` base64 field in payload!",
      );
    }
    const audioFile = await base64ToFile(options.audio, "input.wav");
    form.append("audio", audioFile);

    const extra = options.providerOptions?.elevenLabs ?? {};
    if (extra.model_id) form.append("model_id", String(extra.model_id));
    if (extra.remove_background_noise) {
      form.append("remove_background_noise", "true");
    }
    if (extra.seed !== undefined) {
      form.append("seed", String(extra.seed));
    }
    if (extra.voice_settings) {
      form.append("voice_settings", JSON.stringify(extra.voice_settings));
    }

    return await this.sendFormAndReturnAudio(endpoint, form, options);
  }

  /**
   * (4) Text‐to‐Sound‐Effects
   * POST /v1/sound-generation
   */
  private async textToSoundEffects(options: Omit<AudioPayload, "model">) {
    const endpoint = `/v1/sound-generation`;
    const body: Record<string, unknown> = {
      text: options.prompt ?? "",
      ...this.extractElevenLabsBody(options),
    };

    return await this.sendJsonAndReturnAudio(endpoint, body, options);
  }

  /**
   * (5) Audio Isolation
   * POST /v1/audio-isolation
   */
  private async audioIsolation(options: Omit<AudioPayload, "model">) {
    const endpoint = `/v1/audio-isolation`;
    const form = new FormData();

    if (!options.audio) {
      throw new Error(
        "audio-isolation requires an `audio` base64 field in payload!",
      );
    }
    const audioFile = await base64ToFile(options.audio, "input.wav");
    form.append("audio", audioFile);

    return await this.sendFormAndReturnAudio(endpoint, form, options);
  }

  /**
   * (6) Text‐to‐Voice
   * POST /v1/text-to-voice/create-previews
   */
  private async textToVoice(options: Omit<AudioPayload, "model">) {
    const endpoint = `/v1/text-to-voice/create-previews`;
    const body: Record<string, unknown> = {
      voice_description: "Default description",
      text: options.prompt ?? "",
      ...this.extractElevenLabsBody(options),
    };

    return await this.sendJsonAndParsePreviews(endpoint, body, options);
  }

  /**
   * (7) Create Voice Clone
   * POST /v1/voices/add
   */
  private async createVoiceClone(options: Omit<AudioPayload, "model">) {
    const endpoint = `/v1/voices/add`;
    const form = new FormData();

    const extra = options.providerOptions?.elevenLabs ?? {};

    // Check existence and type of name before appending
    if (!extra.name || typeof extra.name !== "string") {
      throw new Error(
        "voice-clone requires a non-empty string `name` field in providerOptions.elevenLabs!",
      );
    }
    form.append("name", extra.name); // Append the validated name

    // Check fileUrls
    if (
      !extra.fileUrls || !Array.isArray(extra.fileUrls) ||
      extra.fileUrls.length === 0
    ) {
      throw new Error(
        "voice-clone requires a `fileUrls` array in providerOptions.elevenLabs!",
      );
    }

    // Fetch and add each audio file to the form
    for (let i = 0; i < extra.fileUrls.length; i++) {
      const url = extra.fileUrls[i];
      const response = await fetch(url);
      const responseCloneForBody = response.clone(); // Clone for body reading

      if (!response.ok) {
        throw new Error(
          `Failed to fetch audio file from ${url}: ${response.status} ${response.statusText}`,
        );
      }

      // Extract filename from URL, fallback to index
      let filename = `sample_${i}.unknown`;
      let contentType = "application/octet-stream"; // Default content type
      try {
        const urlPath = new URL(url).pathname;
        const lastSegment = urlPath.substring(urlPath.lastIndexOf("/") + 1);
        if (lastSegment) {
          filename = lastSegment;
          // Basic content type inference from extension
          if (filename.toLowerCase().endsWith(".webm")) {
            contentType = "video/webm";
          } else if (filename.toLowerCase().endsWith(".mp3")) {
            contentType = "audio/mpeg";
          } else if (filename.toLowerCase().endsWith(".wav")) {
            contentType = "audio/wav";
          } // Add more types as needed
        }
      } catch (e) {
        console.warn("Could not parse filename/type from URL:", url, e);
      }
      console.log(
        `Processing file for voice clone: ${filename} (type: ${contentType})`,
      );

      // Assume body is Base64 text
      const audioBase64 = await responseCloneForBody.text();

      // Convert Base64 text to File using the utility
      const audioFile = await base64ToFile(audioBase64, filename, contentType);

      // Append the properly decoded File object
      form.append("files", audioFile, filename);
    }

    if (extra.remove_background_noise) {
      form.append("remove_background_noise", "true");
    }
    if (extra.description) {
      form.append("description", extra.description as string);
    }
    if (extra.labels && typeof extra.labels === "string") {
      form.append("labels", extra.labels);
    }

    const url = `${this.config.baseURL}${endpoint}`;
    const headers = {
      ...this.config.headers(),
      ...options.headers,
    } as HeadersInit;

    const resp = await (this.config.fetch ?? fetch)(url, {
      method: "POST",
      headers,
      body: form,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(
        `ElevenLabs voice clone request failed [${resp.status}]: ${text}`,
      );
    }

    const data = await resp.json();
    return {
      voice_id: data.voice_id,
      requires_verification: data.requires_verification,
    } as AudioResponse;
  }

  /**
   * (8) Speech‐to‐Text
   * POST /v1/speech-to-text
   */
  private async speechToText(options: Omit<AudioPayload, "model">) {
    const endpoint = `/v1/speech-to-text`;
    const form = new FormData();
    const extra = options.providerOptions?.elevenLabs ?? {};

    // Expect options.audio to be a base64 string
    if (typeof options.audio !== "string") {
      throw new Error(
        "speech-to-text requires the `audio` field in the payload to be a base64 encoded string!",
      );
    }

    // Convert base64 string to File
    // Use a default filename or extract if provided in providerOptions
    const filename = extra.filename as string ?? "audio.blob";
    const audioFile = await base64ToFile(options.audio, filename, "video/webm");
    form.append("file", audioFile);

    // Add required and optional parameters from providerOptions
    const modelId = extra.model_id ?? "scribe_v1"; // Default model
    form.append("model_id", String(modelId));

    if (extra.language_code !== undefined) {
      form.append("language_code", String(extra.language_code));
    }
    if (extra.tag_audio_events !== undefined) {
      form.append("tag_audio_events", String(extra.tag_audio_events));
    }
    if (extra.num_speakers !== undefined) {
      const numSpeakers = Number(extra.num_speakers);
      if (isNaN(numSpeakers) || numSpeakers < 1 || numSpeakers > 32) {
        console.warn(
          "num_speakers must be a number between 1 and 32. Ignoring value:",
          extra.num_speakers,
        );
      } else {
        form.append("num_speakers", String(numSpeakers));
      }
    }
    if (extra.timestamps_granularity !== undefined) {
      form.append(
        "timestamps_granularity",
        String(extra.timestamps_granularity),
      );
    }
    if (extra.diarize !== undefined) {
      form.append("diarize", String(extra.diarize));
    }

    // Use the helper method to send form and return JSON
    return await this.sendFormAndReturnJson<SpeechToTextResponse>(
      endpoint,
      form,
      options,
    );
  }

  private extractElevenLabsBody(options: Omit<AudioPayload, "model">) {
    const extra = options.providerOptions?.elevenLabs ?? {};
    const clone: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(extra)) {
      clone[k] = v;
    }
    return clone;
  }

  private getVoiceId(options: Omit<AudioPayload, "model">) {
    const voiceId = options.providerOptions?.elevenLabs?.voiceId;
    if (!voiceId) {
      throw new Error(
        `No ElevenLabs voiceId provided. Please supply providerOptions.elevenLabs.voiceId or configure a default.`,
      );
    }
    return voiceId;
  }

  private async sendJsonAndReturnAudio(
    path: string,
    body: Record<string, unknown>,
    options: Omit<AudioPayload, "model">,
  ): Promise<AudioResponse> {
    const url = `${this.config.baseURL}${path}`;
    const headers = {
      ...this.config.headers(),
      ...options.headers,
      "Content-Type": "application/json",
    } as HeadersInit;

    const resp = await (this.config.fetch ?? fetch)(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(
        `ElevenLabs request failed [${resp.status}]: ${text}`,
      );
    }
    const audioBuffer = await resp.arrayBuffer();
    const audioBase64 = bufferToBase64(audioBuffer);
    return { audio: audioBase64 };
  }

  private async sendFormAndReturnAudio(
    path: string,
    form: FormData,
    options: Omit<AudioPayload, "model">,
  ): Promise<AudioResponse> {
    const url = `${this.config.baseURL}${path}`;
    const headers = {
      ...this.config.headers(),
      ...options.headers,
    } as HeadersInit;

    const resp = await (this.config.fetch ?? fetch)(url, {
      method: "POST",
      headers,
      body: form,
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(
        `ElevenLabs request failed [${resp.status}]: ${text}`,
      );
    }
    const audioBuffer = await resp.arrayBuffer();
    const audioBase64 = bufferToBase64(audioBuffer);
    return { audio: audioBase64 };
  }

  private async sendFormAndReturnJson<TResponse>(
    path: string,
    form: FormData,
    options: Omit<AudioPayload, "model">,
  ): Promise<TResponse> {
    const url = `${this.config.baseURL}${path}`;
    const headers = {
      ...this.config.headers(),
      ...options.headers,
    } as HeadersInit;

    const resp = await (this.config.fetch ?? fetch)(url, {
      method: "POST",
      headers,
      body: form,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(
        `ElevenLabs Form request failed [${resp.status}]: ${text}`,
      );
    }

    const jsonResponse = await resp.json();
    return jsonResponse as TResponse;
  }

  private async sendJsonAndParsePreviews(
    path: string,
    body: Record<string, unknown>,
    options: Omit<AudioPayload, "model">,
  ): Promise<AudioResponse> {
    const url = `${this.config.baseURL}${path}`;
    const headers = {
      ...this.config.headers(),
      ...options.headers,
      "Content-Type": "application/json",
    } as HeadersInit;

    const resp = await (this.config.fetch ?? fetch)(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(
        `ElevenLabs request failed [${resp.status}]: ${text}`,
      );
    }

    const data = await resp.json() as {
      previews?: Array<{ audio?: string; text?: string }>;
    };
    if (!data.previews?.length) {
      throw new Error("No previews returned from text-to-voice endpoint.");
    }
    const audios = data.previews
      .filter((p) => p.audio)
      .map((p) => p.audio as string);

    return { audios };
  }

  /**
   * Get Shared Voices
   * GET /v1/shared-voices
   */
  private async getSharedVoices(
    options: Omit<AudioPayload, "model">,
  ): Promise<SharedVoicesResponse> {
    const endpoint = "/v1/shared-voices";
    const sharedVoicesOptions = options.providerOptions?.elevenLabs
      ?.sharedVoices as SharedVoicesOptions || {};

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (sharedVoicesOptions.page_size !== undefined) {
      queryParams.append("page_size", String(sharedVoicesOptions.page_size));
    }
    if (sharedVoicesOptions.category) {
      queryParams.append("category", sharedVoicesOptions.category);
    }
    if (sharedVoicesOptions.gender) {
      queryParams.append("gender", sharedVoicesOptions.gender);
    }
    if (sharedVoicesOptions.age) {
      queryParams.append("age", sharedVoicesOptions.age);
    }
    if (sharedVoicesOptions.accent) {
      queryParams.append("accent", sharedVoicesOptions.accent);
    }
    if (sharedVoicesOptions.language) {
      queryParams.append("language", sharedVoicesOptions.language);
    }
    if (sharedVoicesOptions.locale) {
      queryParams.append("locale", sharedVoicesOptions.locale);
    }
    if (sharedVoicesOptions.search) {
      queryParams.append("search", sharedVoicesOptions.search);
    }
    if (sharedVoicesOptions.use_cases) {
      queryParams.append("use_cases", sharedVoicesOptions.use_cases);
    }
    if (sharedVoicesOptions.descriptives) {
      queryParams.append("descriptives", sharedVoicesOptions.descriptives);
    }
    if (sharedVoicesOptions.featured !== undefined) {
      queryParams.append("featured", String(sharedVoicesOptions.featured));
    }
    if (sharedVoicesOptions.min_notice_period_days !== undefined) {
      queryParams.append(
        "min_notice_period_days",
        String(sharedVoicesOptions.min_notice_period_days),
      );
    }
    if (sharedVoicesOptions.reader_app_enabled !== undefined) {
      queryParams.append(
        "reader_app_enabled",
        String(sharedVoicesOptions.reader_app_enabled),
      );
    }
    if (sharedVoicesOptions.owner_id) {
      queryParams.append("owner_id", sharedVoicesOptions.owner_id);
    }
    if (sharedVoicesOptions.sort) {
      queryParams.append("sort", sharedVoicesOptions.sort);
    }
    if (sharedVoicesOptions.page !== undefined) {
      queryParams.append("page", String(sharedVoicesOptions.page));
    }

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";
    const url = `${this.config.baseURL}${endpoint}${queryString}`;

    const headers = {
      ...this.config.headers(),
      ...options.headers,
      "Accept": "application/json",
    } as HeadersInit;

    const resp = await (this.config.fetch ?? fetch)(url, {
      method: "GET",
      headers,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(
        `ElevenLabs shared voices request failed [${resp.status}]: ${text}`,
      );
    }

    return await resp.json() as SharedVoicesResponse;
  }
}
