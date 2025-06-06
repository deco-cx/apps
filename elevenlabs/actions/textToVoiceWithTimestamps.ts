import { AppContext } from "../mod.ts";

/**
 * @name TEXT_TO_VOICE_WITH_TIMESTAMPS
 * @description Converts text to speech with timestamps using ElevenLabs
 */
export interface Props {
  /**
   * @description The text to convert to speech
   */
  text: string;
  /**
   * @description The voice ID to use for speech generation
   */
  voiceId: string;
  /**
   * @description The model ID to use
   * @default eleven_monolingual_v1
   */
  modelId?: string;
  /**
   * @description Voice settings for customization
   */
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface Timestamp {
  text: string;
  start: number;
  end: number;
}

export default async function textToVoiceWithTimestamps(
  { text, voiceId, modelId = "eleven_monolingual_v1", voiceSettings }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const elevenLabs = ctx.elevenLabs;
  const model = elevenLabs("tts-timestamps");

  const response = await model.doGenerate({
    prompt: text,
    providerOptions: {
      elevenLabs: {
        voiceId,
        model_id: modelId,
        voice_settings: voiceSettings,
      },
    },
  });

  return {
    audio: response.audio,
    timestamps: response.timestamps as Timestamp[],
  };
}
