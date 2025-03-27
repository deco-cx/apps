import { generateText } from "npm:ai";
import { Buffer } from "node:buffer";
import { AppContext } from "../mod.ts";

/**
 * @name transcribe_audio
 * @description Transcribes an audio file
 */
export interface Props {
  audioUrl: string;
}
export default async function transcribeAudio(
  { audioUrl }: Props,
  _request: Request,
  ctx: AppContext,
) {
  const vertexClient = ctx.vertexClient;
  const response = await fetch(audioUrl);
  const audioData = await response.arrayBuffer();

  const transcriptionModel = vertexClient("gemini-1.5-pro", {
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
