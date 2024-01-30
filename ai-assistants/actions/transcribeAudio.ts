import OpenAI from "https://deno.land/x/openai@v4.24.1/mod.ts";
import { logger } from "deco/observability/otel/config.ts";
import base64ToBlob from "../utils/blobConversion.ts";
import { Ids } from "../types.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") || "" });

export interface TranscribeAudioProps {
  file: string | ArrayBuffer | null;
  ids?: Ids;
}

export default async function transcribeAudio(
  transcribeAudioProps: TranscribeAudioProps,
) {
  if (!transcribeAudioProps.file) {
    logger.error(`${
      JSON.stringify({
        assistantId: transcribeAudioProps.ids?.assistantId,
        threadId: transcribeAudioProps.ids?.threadId,
        context: "transcribeAudio",
        error: "Audio file is empty",
      })
    }`);
    throw new Error("Audio file is empty");
  }

  const blobData = base64ToBlob(
    transcribeAudioProps.file,
    "audio",
    transcribeAudioProps.ids,
  );
  const file = new File([blobData], "input.wav", { type: "audio/wav" });
  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: file,
  });
  logger.info({
    assistantId: transcribeAudioProps.ids?.assistantId,
    threadId: transcribeAudioProps.ids?.threadId,
    context: "transcribeAudio",
    subcontext: "response",
    response: JSON.stringify(response),
  });
  return response;
}
