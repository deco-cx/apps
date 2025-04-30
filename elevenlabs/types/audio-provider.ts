import type { AudioPayload, AudioResponse } from "./audio.ts";

/**
 * An interface representing a generic audio generation model.
 */
export interface AudioModelV1 {
  readonly specificationVersion: "v1";
  readonly modelId: string;
  readonly provider: string;
  doGenerate(
    options: Omit<AudioPayload, "model">,
  ): Promise<AudioResponse | SharedVoicesResponse>;
  getAudio?(id: string): Promise<AudioResponse>;
}

export interface AudioProvider {
  audio: (modelId: string) => AudioModelV1;
}

export function generateAudio(
  payload: Omit<AudioPayload, "model"> & { model: AudioModelV1 },
): Promise<AudioResponse> {
  return payload.model.doGenerate(payload);
}

// Shared Voices Types
export interface SharedVoicesResponse {
  voices: SharedVoice[];
  has_more: boolean;
  last_sort_id?: string;
  [key: string]: unknown;
}

export interface SharedVoice {
  public_owner_id: string;
  voice_id: string;
  date_unix: number;
  name: string;
  accent: string;
  gender: string;
  age: string;
  descriptive: string;
  use_case: string;
  category: string;
  usage_character_count_1y: number;
  usage_character_count_7d: number;
  play_api_usage_character_count_1y: number;
  cloned_by_count: number;
  free_users_allowed: boolean;
  live_moderation_enabled: boolean;
  featured: boolean;
  language?: string;
  locale?: string;
  description?: string;
  preview_url?: string;
  rate?: number;
  verified_languages?: VerifiedLanguage[];
  notice_period?: number;
  instagram_username?: string;
  twitter_username?: string;
  youtube_username?: string;
  tiktok_username?: string;
  image_url?: string;
  is_added_by_user?: boolean;
}

export interface VerifiedLanguage {
  language: string;
  model_id: string;
  accent?: string;
  locale?: string;
  preview_url?: string;
}

export interface SharedVoicesOptions {
  page_size?: number;
  category?: string;
  gender?: string;
  age?: string;
  accent?: string;
  language?: string;
  locale?: string;
  search?: string;
  use_cases?: string;
  descriptives?: string;
  featured?: boolean;
  min_notice_period_days?: number;
  reader_app_enabled?: boolean;
  owner_id?: string;
  sort?: string;
  page?: number;
}
