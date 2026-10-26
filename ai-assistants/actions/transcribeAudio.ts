import base64ToBlob from "../utils/blobConversion.ts";
import { AssistantIds } from "../types.ts";
import { AppContext } from "../mod.ts";
import { logger } from "@deco/deco/o11y";
import {
  ATTR_ASSISTANT_ID,
  ATTR_ASSISTANT_OPERATION,
  stats,
} from "../observability.ts";
export interface TranscribeAudioProps {
  file: string | ArrayBuffer | null;
  assistantIds?: AssistantIds;
  audioDuration: number;
}
// TODO(ItamarRocha): Rate limit
export default async function transcribeAudio(
  transcribeAudioProps: TranscribeAudioProps,
  _req: Request,
  ctx: AppContext,
) {
  const assistantId = transcribeAudioProps.assistantIds?.assistantId;
  const threadId = transcribeAudioProps.assistantIds?.threadId;
  if (!transcribeAudioProps.file) {
    stats.errors.add(1, {
      [ATTR_ASSISTANT_OPERATION]: "transcribe_audio",
      [ATTR_ASSISTANT_ID]: assistantId,
    });
    throw new Error("Audio file is empty");
  }
  const blobData = base64ToBlob(
    transcribeAudioProps.file,
    "audio",
    transcribeAudioProps.assistantIds,
  );
  const file = new File([blobData], "input.wav", { type: "audio/wav" });
  stats.audioDuration.record(transcribeAudioProps.audioDuration, {
    [ATTR_ASSISTANT_ID]: assistantId,
  });
  const response = await ctx.openAI.audio.transcriptions.create({
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
