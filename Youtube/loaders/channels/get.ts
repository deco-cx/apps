import { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type { YoutubeChannelResponse } from "../../utils/types.ts";
import { STALE } from "../../../utils/fetch.ts";

/**
 * Opções para buscar canais do YouTube
 */
export interface ChannelOptions {
  /**
   * @description Buscar canal do usuário autenticado
   */
  mine?: boolean;

  /**
   * @description Partes adicionais a serem incluídas na resposta
   */
  part?: string;

  /**
   * @description ID do canal específico a ser buscado
   */
  id?: string;

  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;

  /**
   * @description Ignorar cache para esta solicitação
   */
  skipCache?: boolean;
}

export interface ChannelResult {
  channels: YoutubeChannelResponse;
}

export interface ChannelError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type ChannelResponse = ChannelResult | ChannelError;

/**
 * @title Fetch YouTube Channels
 * @description Retrieves information about YouTube channels for the authenticated user or by specific ID
 */
export default async function loader(
  props: ChannelOptions,
  req: Request,
  ctx: AppContext,
): Promise<ChannelResponse> {
  const client = ctx.client;
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  if (!accessToken) {
    return createErrorResponse(
      401,
      "Autenticação necessária para obter dados do canal",
    );
  }

  const { part = "snippet", id, mine = true } = props;

  // Validar parâmetros
  if (!id && !mine) {
    return createErrorResponse(
      400,
      "É necessário fornecer um ID de canal ou definir mine=true",
    );
  }

  try {
    const response = await client["GET /channels"]({ part, id, mine }, {
      headers: { Authorization: `Bearer ${accessToken}` },
      ...STALE,
    });

    // Verificar erro de autenticação
    if (response.status === 401) {
      // Sinalizar que o token está expirado
      ctx.response.headers.set("X-Token-Expired", "true");
      ctx.response.headers.set("Cache-Control", "no-store");
      return createErrorResponse(
        401,
        "Token de autenticação expirado ou inválido",
      );
    }

    if (!response.ok) {
      return createErrorResponse(
        response.status,
        `Erro ao buscar dados do canal: ${response.status}`,
        await response.text(),
      );
    }

    const channelData = await response.json();

    return {
      channels: channelData,
    };
  } catch (error) {
    return createErrorResponse(
      500,
      "Erro ao processar dados do canal",
      error instanceof Error ? error.message : String(error),
    );
  }
}

function createErrorResponse(
  code: number,
  message: string,
  details?: unknown,
): ChannelError {
  return {
    message,
    error: true,
    code,
    details,
  };
}

export const cache = "stale-while-revalidate";

export const cacheKey = (
  props: ChannelOptions,
  req: Request,
  ctx: AppContext,
) => {
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  // Verificar se há flag de token expirado
  const tokenExpired = req.headers.get("X-Token-Expired") === "true";

  // Não usar cache se não houver token, for canal do usuário autenticado, skipCache for verdadeiro
  // ou se o token estiver expirado
  if (
    !accessToken || (props.mine === true && !props.id) || props.skipCache ||
    tokenExpired
  ) {
    return null;
  }

  // Incluir fragmento do token na chave de cache
  const tokenFragment = accessToken.slice(-8);

  const params = new URLSearchParams([
    ["id", props.id || ""],
    ["part", props.part || "snippet"],
    ["mine", (props.mine || false).toString()],
    ["tokenId", tokenFragment],
  ]);

  params.sort();

  return `youtube-channel-${params.toString()}`;
};
