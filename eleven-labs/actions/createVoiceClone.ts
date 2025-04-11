import { AppContext } from "../mod.ts";

/**
 * @name CREATE_VOICE_CLONE
 * @description Creates a new voice clone using ElevenLabs
 */
export interface Props {
  /**
   * @description The name that identifies this voice
   */
  name: string;
  /**
   * @description A list of URLs to audio files for voice cloning
   */
  fileUrls: string[];
  /**
   * @description Whether to remove background noise from the samples
   * @default false
   */
  removeBackgroundNoise?: boolean;
  /**
   * @description A description of the voice
   */
  description?: string;
  /**
   * @description Serialized labels dictionary for the voice
   */
  labels?: string;
}

export default async function createVoiceClone(
  {
    name,
    fileUrls,
    removeBackgroundNoise = false,
    description,
    labels,
  }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const elevenLabs = ctx.elevenLabs;
  const model = elevenLabs("voice-clone");

  console.log({ fileUrls });

  const response = await model.doGenerate({
    providerOptions: {
      elevenLabs: {
        name,
        fileUrls,
        remove_background_noise: removeBackgroundNoise,
        description,
        labels,
      },
    },
  });

  return {
    voice_id: response.voice_id,
    requires_verification: response.requires_verification,
  };
}
