import { AppContext } from "../mod.ts";

/**
 * @title ElevenLabs Speech to Text Transcription
 * @description Transcribes an audio file using the ElevenLabs Speech to Text API.
 * @see {@link https://elevenlabs.io/docs/api-reference/speech-to-text/convert}
 */
export interface Props {
  /**
   * @description The URL of the audio file to transcribe.
   * The file will be fetched and sent to the API.
   */
  audioUrl: string;

  /**
   * @description The ID of the model to use for transcription.
   * @default scribe_v1
   */
  model_id?: "scribe_v1" | "scribe_v1_experimental";

  /**
   * @description Optional ISO-639-1 or ISO-639-3 language code.
   * Improves performance if known. Auto-detected if null.
   */
  language_code?: string;

  /**
   * @description Whether to tag audio events like (laughter), (footsteps).
   * @default true
   */
  tag_audio_events?: boolean;

  /**
   * @description Maximum number of speakers to detect (1-32).
   * Helps with speaker diarization. Defaults to model maximum if null.
   */
  num_speakers?: number;

  /**
   * @description Granularity of timestamps ('word' or 'character').
   * @default word
   */
  timestamps_granularity?: "none" | "word" | "character";

  /**
   * @description Whether to annotate which speaker is talking (diarization).
   * @default false
   */
  diarize?: boolean;

  // Note: additional_formats and file_format are not implemented for simplicity
  // Note: enable_logging is not exposed as it relates to enterprise features/history
}

// The response structure is now handled within audio-model.ts, but we might need it here
// for type safety if we don't rely on the `any` return type from doGenerate.
// For now, we'll assume the response matches the structure defined there.
// interface TranscriptionResponse { ... }

/**
 * @name TRANSCRIBE_AUDIO
 * @description Transcribes audio from a URL using ElevenLabs Speech to Text via the client.
 */
export default async function transcribeAudio(
  {
    audioUrl,
    // Extract only the STT specific params for providerOptions
    model_id = "scribe_v1", // Keep default here for clarity
    language_code,
    tag_audio_events,
    num_speakers,
    timestamps_granularity,
    diarize,
  }: Props,
  _request: Request,
  ctx: AppContext,
) {
  // 1. Fetch the audio file from the URL
  const audioResponse = await fetch(audioUrl);
  // Clone the response immediately
  const responseCloneForBody = audioResponse.clone();

  // Use the original response for headers and status checks
  const status = audioResponse.status;
  const contentTypeHeader = audioResponse.headers.get("content-type") || "";
  console.log(
    `Fetched audio. Status: ${status}, Content-Type: ${contentTypeHeader}`,
  );
  if (!audioResponse.ok) {
    throw new Error(
      `Failed to fetch audio file from ${audioUrl}: ${audioResponse.statusText}`,
    );
  }

  // Get the response body as text FROM THE CLONE
  const audioBase64 = await responseCloneForBody.text();
  console.log(`Audio Base64 string size: ${audioBase64.length}`);
  console.log(`First 80 chars of Base64: ${audioBase64.substring(0, 80)}`);

  // Extract filename from URL, default to 'audio.webm'
  let filename = "audio.webm";
  try {
    const urlPath = new URL(audioUrl).pathname;
    const lastSegment = urlPath.substring(urlPath.lastIndexOf("/") + 1);
    if (lastSegment) {
      // Use the content type retrieved earlier
      if (
        contentTypeHeader.includes("webm") &&
        !lastSegment.toLowerCase().endsWith(".webm")
      ) {
        filename = `${lastSegment}.webm`;
      } else if (lastSegment.includes(".")) { // Use original if it has extension
        filename = lastSegment;
      } else { // Add .webm if no extension and content type suggests webm
        filename = `${lastSegment}.webm`;
      }
    }
  } catch (e) {
    console.warn("Could not parse filename from URL:", audioUrl, e);
  }
  console.log(`Using filename for API: ${filename}`);

  // 2. Get the ElevenLabs client instance configured for speech-to-text
  const elevenLabs = ctx.elevenLabs("speech-to-text");

  // 3. Call the doGenerate method with the base64 audio and provider options
  const response = await elevenLabs.doGenerate({
    audio: audioBase64, // Pass the base64 string
    providerOptions: {
      elevenLabs: {
        // Pass the specific parameters for the speechToText method
        model_id,
        language_code,
        tag_audio_events,
        num_speakers,
        timestamps_granularity,
        diarize,
        // Pass the extracted filename
        filename: filename,
      },
    },
    // No prompt needed for speech-to-text
  });

  // 4. Return the JSON response from the API
  return response;
}
