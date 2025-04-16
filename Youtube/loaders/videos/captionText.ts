import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";

export interface CaptionTextOptions {
  /**
   * @description ID da legenda para buscar texto (obtido da listagem de legendas)
   */
  captionId: string;
  /**
   * @description Formato de saída da legenda (padrão: srt)
   */
  format?: "srt" | "sbv" | "vtt";
  /**
   * @description Código de idioma para tradução (opcional)
   */
  translationLanguage?: string;
  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
}

interface ParsedCaption {
  format: string;
  captions: Array<{
    index: number;
    startTime: string;
    endTime: string;
    text: string;
  }>;
  rawText: string;
}

/**
 * @title Buscar Texto de Legenda
 * @description Obtém o texto completo de uma legenda específica no formato escolhido
 */
export default async function loader(
  props: CaptionTextOptions,
  req: Request,
  _ctx: AppContext,
): Promise<ParsedCaption | null> {
  const { captionId, format = "srt", translationLanguage, tokenYoutube } =
    props;

  const accessToken = getAccessToken(req) || tokenYoutube;

  if (!accessToken) {
    console.error("Autenticação necessária para obter o texto da legenda");
    return null;
  }

  if (!captionId) {
    console.error("ID da legenda é obrigatório");
    return null;
  }

  try {
    // Constrói a URL para buscar a legenda
    let url = `https://www.googleapis.com/youtube/v3/captions/${captionId}`;

    // Adiciona parâmetros para formato e tradução
    const params = new URLSearchParams();
    params.append("tfmt", format);
    if (translationLanguage) {
      params.append("tlang", translationLanguage);
    }

    url += `?${params.toString()}`;

    // Busca o texto da legenda
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `Erro ao buscar texto da legenda: ${response.status} ${response.statusText}`,
        errorData,
      );
      return null;
    }

    // Obtém o texto bruto da legenda
    const captionText = await response.text();

    // Faz o parse do texto da legenda de acordo com o formato
    const parsedCaption: ParsedCaption = {
      format,
      captions: [],
      rawText: captionText,
    };

    // Faz o parse com base no formato
    if (format === "srt") {
      parsedCaption.captions = parseSrtCaption(captionText);
    } else if (format === "sbv") {
      parsedCaption.captions = parseSbvCaption(captionText);
    } else if (format === "vtt") {
      parsedCaption.captions = parseVttCaption(captionText);
    }

    return parsedCaption;
  } catch (error) {
    console.error(`Erro ao buscar texto da legenda ${captionId}:`, error);
    return null;
  }
}

/**
 * Parse SRT format captions
 */
function parseSrtCaption(
  text: string,
): Array<{ index: number; startTime: string; endTime: string; text: string }> {
  const captions: Array<
    { index: number; startTime: string; endTime: string; text: string }
  > = [];

  // Divide o texto por blocos de legendas
  const blocks = text.trim().split(/\r?\n\r?\n/);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    if (lines.length < 3) continue;

    const index = parseInt(lines[0], 10);
    const timecodes = lines[1].split(" --> ");
    const startTime = timecodes[0];
    const endTime = timecodes[1];
    const textLines = lines.slice(2);

    captions.push({
      index,
      startTime,
      endTime,
      text: textLines.join("\n"),
    });
  }

  return captions;
}

/**
 * Parse SBV format captions
 */
function parseSbvCaption(
  text: string,
): Array<{ index: number; startTime: string; endTime: string; text: string }> {
  const captions: Array<
    { index: number; startTime: string; endTime: string; text: string }
  > = [];

  // Divide o texto por blocos de legendas
  const blocks = text.trim().split(/\r?\n\r?\n/);
  let index = 1;

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    if (lines.length < 2) continue;

    const timecodes = lines[0].split(",");
    const startTime = timecodes[0];
    const endTime = timecodes[1];
    const textLines = lines.slice(1);

    captions.push({
      index: index++,
      startTime,
      endTime,
      text: textLines.join("\n"),
    });
  }

  return captions;
}

/**
 * Parse VTT format captions
 */
function parseVttCaption(
  text: string,
): Array<{ index: number; startTime: string; endTime: string; text: string }> {
  const captions: Array<
    { index: number; startTime: string; endTime: string; text: string }
  > = [];

  // Divide o texto por blocos de legendas
  const blocks = text.trim().split(/\r?\n\r?\n/);
  let index = 1;

  // Pula o cabeçalho WEBVTT
  for (let i = 1; i < blocks.length; i++) {
    const lines = blocks[i].split(/\r?\n/);
    if (lines.length < 2) continue;

    let timeCodeLineIndex = 0;

    // Verifica se a primeira linha é um índice ou um timecode
    if (!lines[0].includes("-->")) {
      timeCodeLineIndex = 1;
    }

    if (timeCodeLineIndex >= lines.length) continue;

    const timecodes = lines[timeCodeLineIndex].split(" --> ");
    const startTime = timecodes[0];
    const endTime = timecodes[1];
    const textLines = lines.slice(timeCodeLineIndex + 1);

    captions.push({
      index: index++,
      startTime,
      endTime,
      text: textLines.join("\n"),
    });
  }

  return captions;
}
