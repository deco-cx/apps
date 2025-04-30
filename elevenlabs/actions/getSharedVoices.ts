import { AppContext } from "../mod.ts";
import { SharedVoice } from "../types/audio-provider.ts";

/**
 * @name GET_SHARED_VOICES
 * @description Retrieves a list of shared voices from ElevenLabs that can be used for text-to-speech
 */
export interface Props {
  /**
   * @description Maximum number of voices to return (max 100, default 30)
   */
  pageSize?: number;
  /**
   * @description Voice category for filtering (e.g., professional, famous, high_quality)
   */
  category?: string;
  /**
   * @description Gender for filtering
   */
  gender?: string;
  /**
   * @description Age for filtering
   */
  age?: string;
  /**
   * @description Accent for filtering
   */
  accent?: string;
  /**
   * @description Language for filtering
   */
  language?: string;
  /**
   * @description Locale for filtering
   */
  locale?: string;
  /**
   * @description Search term for filtering
   */
  search?: string;
  /**
   * @description Use-case for filtering
   */
  useCases?: string;
  /**
   * @description Descriptives for filtering
   */
  descriptives?: string;
  /**
   * @description Filter only featured voices
   * @default false
   */
  featured?: boolean;
  /**
   * @description Filter voices with a minimum notice period of given days
   */
  minNoticePeriodDays?: number;
  /**
   * @description Filter voices enabled for reader app
   * @default false
   */
  readerAppEnabled?: boolean;
  /**
   * @description Filter voices by public owner ID
   */
  ownerId?: string;
  /**
   * @description Sort criteria
   */
  sort?: string;
  /**
   * @description Page number
   * @default 0
   */
  page?: number;
}

export interface VoiceResult {
  id: string;
  name: string;
  gender: string;
  accent: string;
  age: string;
  description?: string;
  previewUrl?: string;
  featured: boolean;
  category: string;
  freeUsersAllowed: boolean;
}

export default async function getSharedVoices(
  {
    pageSize,
    category,
    gender,
    age,
    accent,
    language,
    locale,
    search,
    useCases,
    descriptives,
    featured,
    minNoticePeriodDays,
    readerAppEnabled,
    ownerId,
    sort,
    page,
  }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const elevenLabs = ctx.elevenLabs;
  const model = elevenLabs("shared-voices");

  try {
    const result = await model.doGenerate({
      providerOptions: {
        elevenLabs: {
          sharedVoices: {
            page_size: pageSize,
            category,
            gender,
            age,
            accent,
            language,
            locale,
            search,
            use_cases: useCases,
            descriptives,
            featured,
            min_notice_period_days: minNoticePeriodDays,
            reader_app_enabled: readerAppEnabled,
            owner_id: ownerId,
            sort,
            page,
          },
        },
      },
    });

    // Transform the voices to a simplified format for the client
    const voices: VoiceResult[] = result.voices.map((voice: SharedVoice) => ({
      id: voice.voice_id,
      name: voice.name,
      gender: voice.gender,
      accent: voice.accent,
      age: voice.age,
      description: voice.description,
      previewUrl: voice.preview_url,
      featured: voice.featured,
      category: voice.category,
      freeUsersAllowed: voice.free_users_allowed,
    }));

    return {
      content: [
        {
          type: "text",
          text: `Retrieved ${voices.length} voices from ElevenLabs.`,
        },
      ],
      data: {
        voices,
        hasMore: result.has_more,
        lastSortId: result.last_sort_id,
      },
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
