import { AppContext } from "../mod.ts";

/**
 * @name AUDIO_ISOLATION
 * @description Isolates specific elements from an audio file using ElevenLabs
 */
export interface Props {
  /**
   * @description The base64 encoded audio file to process
   */
  audio: string;
  /**
   * @description The type of isolation to perform
   * @default voice
   */
  isolationType?: "voice" | "music" | "background";
}

export default async function audioIsolation(
  { audio, isolationType = "voice" }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const elevenLabs = ctx.elevenLabs;
  const model = elevenLabs("audio-isolation");

  const response = await model.doGenerate({
    audio,
    providerOptions: {
      elevenLabs: {
        isolation_type: isolationType,
      },
    },
  });

  return {
    audio: response.audio,
  };
}
