import type { AudioPayload, AudioResponse } from "./audio.ts";

/**
 * An interface representing a generic audio generation model.
 */
export interface AudioModelV1 {
  doGenerate(options: Omit<AudioPayload, "model">): Promise<AudioResponse>;
  getAudio?(id: string): Promise<AudioResponse>;
}

export interface AudioProvider {
  audio: (modelId: string) => AudioModelV1;
}

export function generateAudio(
  payload: Omit<AudioPayload, "model"> & { model: AudioModelV1 },
): Promise<AudioResponse> {
  return payload.model.doGenerate(payload);
} 