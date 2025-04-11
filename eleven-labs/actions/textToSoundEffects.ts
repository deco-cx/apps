import { AppContext } from "../mod.ts";

/**
 * @name TEXT_TO_SOUND_EFFECTS
 * @description Generates sound effects from text using ElevenLabs
 */
export interface Props {
  /**
   * @description The text description of the sound effect to generate
   */
  text: string;
  /**
   * @description The duration of the sound effect in seconds
   * @default 5
   */
  durationSeconds?: number;
  /**
   * @description How much the prompt should influence the generation (0-1)
   * @default 0.5
   */
  promptInfluence?: number;
}

export default async function textToSoundEffects(
  {
    text,
    durationSeconds = 5,
    promptInfluence = 0.5,
  }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const elevenLabs = ctx.elevenLabs;
  const model = elevenLabs("sound-effects");

  const response = await model.doGenerate({
    prompt: text,
    providerOptions: {
      elevenLabs: {
        duration_seconds: durationSeconds,
        prompt_influence: promptInfluence,
      },
    },
  });

  return {
    audio: response.audio,
  };
}
