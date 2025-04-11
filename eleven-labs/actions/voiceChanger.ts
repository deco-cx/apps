import { AppContext } from "../mod.ts";
import { Buffer } from "node:buffer";

/**
 * @name VOICE_CHANGER
 * @description Changes the voice of an audio file using ElevenLabs and uploads the result to a presigned URL
 */
export interface Props {
  /**
   * @description The presigned URL to upload the audio to after generation
   */
  presignedUrl: string;
  /**
   * @description The base64 encoded audio file to process
   */
  audio: string;
  /**
   * @description The voice ID to change the audio to
   */
  voiceId: string;
  /**
   * @description The model ID to use
   * @default eleven_monolingual_v1
   */
  modelId?: string;
  /**
   * @description Whether to remove background noise
   * @default true
   */
  removeBackgroundNoise?: boolean;
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

export default async function voiceChanger(
  {
    presignedUrl,
    audio,
    voiceId,
    modelId = "eleven_monolingual_v1",
    removeBackgroundNoise = true,
    voiceSettings,
  }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const elevenLabs = ctx.elevenLabs;
  const model = elevenLabs("voice-changer");

  try {
    const result = await model.doGenerate({
      audio,
      providerOptions: {
        elevenLabs: {
          voiceId,
          model_id: modelId,
          remove_background_noise: removeBackgroundNoise,
          voice_settings: voiceSettings,
        },
      },
    });

    if (!result.audio) {
      throw new Error("No audio generated");
    }

    const url = await uploadAudio(result.audio, presignedUrl);

    return {
      content: [
        {
          type: "text",
          text: `Audio available at ${url}`,
        },
      ],
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function uploadAudio(audio: string, presignedUrl: string) {
  console.log("Starting audio upload...");
  console.log("Presigned URL:", presignedUrl);
  console.log("Audio length:", audio.length);

  const audioBuffer = new Uint8Array(Buffer.from(audio, "base64"));
  console.log("Audio buffer length:", audioBuffer.length);

  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: audioBuffer,
  });

  console.log("Upload response status:", response.status);
  console.log(
    "Upload response headers:",
    Object.fromEntries(response.headers.entries()),
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload failed with response:", errorText);
    throw new Error(`Failed to upload audio: ${response.status} ${errorText}`);
  }

  try {
    const data = await response.json();
    console.log("Upload response data:", data);
    return data.url;
  } catch (error) {
    console.error("Failed to parse upload response:", error);
    throw new Error("Failed to parse upload response");
  }
}
