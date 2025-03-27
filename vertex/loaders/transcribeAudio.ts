import { generateText } from "npm:ai@4.2.0";
import { Buffer } from "node:buffer";
import { AppContext } from "../mod.ts";

/**
 * @name TRANSCRIBE_AUDIO
 * @description Transcribes an audio file from a public URL using any google model that supports audio transcription
 */
export interface Props {
  /**
   * @description The public URL of the audio file to transcribe
   */
  audioUrl: string;
  /**
   * @description The google model to use for transcription
   * @default gemini-1.5-pro
   */
  model?: string;
}
export default async function transcribeAudio(
  { audioUrl, model = "gemini-1.5-pro" }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const vertexClient = ctx.vertexClient;
  const response = await fetch(audioUrl);
  const audioData = await response.arrayBuffer();

  const transcriptionModel = vertexClient(model, {
    audioTimestamp: true,
  });

  const { text } = await generateText({
    model: transcriptionModel,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Please transcribe this audio file. Include timestamps if available.",
          },
          {
            type: "file",
            mimeType: "audio/mpeg",
            data: Buffer.from(audioData),
          },
        ],
      },
    ],
  });

  return {
    content: [
      {
        type: "text",
        text: text,
      },
    ],
  };
}
