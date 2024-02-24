import OpenAI from "https://deno.land/x/openai@v4.24.1/mod.ts";
import { logger } from "deco/observability/otel/config.ts";
import base64ToBlob from "../utils/blobConversion.ts";
import { meter } from "deco/observability/otel/metrics.ts";
import { AssistantIds } from "../types.ts";
import { ValueType } from "deco/deps.ts";

const stats = {
  audioSize: meter.createHistogram("assistant_transcribe_audio_size", {
    description:
      "Audio size used in Sales Assistant Transcribe Image Input - OpenAI",
    unit: "s",
    valueType: ValueType.DOUBLE,
  }),
  transcribeAudioError: meter.createCounter("assistant_transcribe_audio_error", {
    unit: "1",
    valueType: ValueType.INT,
  }),
};
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") || "" });

export interface TranscribeAudioProps {
  file: string | ArrayBuffer | null;
  assistantIds?: AssistantIds;
  audioDuration: number;
}

export default async function transcribeAudio(
  transcribeAudioProps: TranscribeAudioProps,
) {
  const assistantId = transcribeAudioProps.assistantIds?.assistantId;
  const threadId = transcribeAudioProps.assistantIds?.threadId;
  if (!transcribeAudioProps.file) {
    stats.transcribeAudioError.add(1, {
      assistantId,
    });
    throw new Error("Audio file is empty");
  }

  const blobData = base64ToBlob(
    transcribeAudioProps.file,
    "audio",
    transcribeAudioProps.assistantIds,
  );
  const file = new File([blobData], "input.wav", { type: "audio/wav" });

  stats.audioSize.record(transcribeAudioProps.audioDuration, {
    assistant_id: assistantId,
  });
  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: file,
  });
  logger.info({
    assistantId: assistantId,
    threadId: threadId,
    context: "transcribeAudio",
    subcontext: "response",
    response: JSON.stringify(response),
  });
  return response;
}
