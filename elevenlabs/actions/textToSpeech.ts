import { AppContext } from "../mod.ts";
import { Buffer } from "node:buffer";

/**
 * @name TEXT_TO_SPEECH
 * @description Converts text to speech using ElevenLabs and uploads the result to a presigned URL. You may be able to obtain a presigned URL from a tool like CREATE_PRESIGNED_URL.
 */
export interface Props {
  /**
   * @description The presigned URL to upload the audio to after generation. The result will be accessible at this URL.
   */
  presignedUrl: string;
  /**
   * @description The text to convert to speech
   */
  text: string;
  /**
   * @description The voice ID to use for speech generation
   * @default ceKvDJFpP9XqmH31tZxp
   *
   * 21m00Tcm4TlvDq8ikWAM
   */
  voiceId: string;
  /**
   * @description The model ID to use
   * @default eleven_monolingual_v1
   */
  modelId?: string;
  /**
   * @description Voice settings for customization. Example:
   *  {
   *    stability: 0.5,
   *    similarity_boost: 0.5,
   *    style: 0.5,
   *    use_speaker_boost: true
   *  }
   */
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export default async function textToSpeech(
  {
    presignedUrl,
    text,
    voiceId,
    modelId = "eleven_monolingual_v1",
    voiceSettings,
  }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const elevenLabs = ctx.elevenLabs;
  const model = elevenLabs("tts");

  try {
    const result = await model.doGenerate({
      prompt: text,
      providerOptions: {
        elevenLabs: {
          voiceId,
          model_id: modelId,
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
