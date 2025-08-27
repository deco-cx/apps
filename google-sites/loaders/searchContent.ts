import { AppContext } from "../mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";
import type { SearchResult } from "../utils/types.ts";

export interface Props {
  /**
   * @title ID do Site (Arquivo no Google Drive)
   * @description O ID do arquivo do Google Site que pode ser encontrado na URL do Drive
   */
  siteId?: string;
  /**
   * @title URL pública do Google Sites
   * @description URL completa do site (ex.: https://sites.google.com/view/<slug>/home). Para sites públicos, o conteúdo será resolvido automaticamente por esta URL. Também detecta URLs no formato 'https://sites.google.com/d/<siteId>/p/<pageId>/edit' e extrai automaticamente o siteId para usar a exportação do Drive (ideal para sites privados).
   */
  siteUrl?: string;
  /**
   * @title URL do arquivo no Google Drive
   * @description Alternativa ao siteId: informe a URL do arquivo no Drive que contenha o ID
   */
  fileUrl?: string;
  /**
   * @title Termo de busca
   * @description O texto ou palavra-chave que você deseja encontrar no site
   */
  query: string;
  /**
   * @title Página
   * @description O número da página de resultados
   * @default 1
   */
  page?: number;
  /**
   * @title Itens por página
   * @default 10
   */
  pageSize?: number;
}

/**
 * @title Buscar conteúdo em um Google Site
 * @description Realiza uma busca textual no conteúdo do site e retorna parágrafos relevantes
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  {
    results: SearchResult[];
    total: number;
    page: number;
    pageSize: number;
    info?: string;
  }
> => {
  const { siteId, siteUrl, fileUrl, query, page = 1, pageSize = 10 } = props;

  // Normalização: remove espaços extras e aspas/crases ao redor
  const normalize = (s?: string) =>
    s?.trim().replace(/^['"`]\s*|\s*['"`]$/g, "");
  const siteIdNorm = normalize(siteId);
  const siteUrlNorm = normalize(siteUrl);
  const fileUrlNorm = normalize(fileUrl);

  // Exigir pelo menos um identificador de origem do conteúdo
  if (!siteUrlNorm && !fileUrlNorm && !siteIdNorm) {
    return {
      results: [],
      total: 0,
      page,
      pageSize,
      info:
        "Forneça pelo menos um dos parâmetros: siteUrl (público), fileUrl (Drive) ou siteId (Drive).",
    };
  }

  // Detecta siteId em URLs do tipo sites.google.com/d/<siteId>/...
  const extractSiteIdFromSiteUrl = (url: string): string | null => {
    const m = url.match(
      /https?:\/\/sites\.google\.com\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/,
    );
    return m ? m[1] : null;
  };
  const siteIdFromSiteUrl = siteUrlNorm
    ? extractSiteIdFromSiteUrl(siteUrlNorm)
    : null;

  // Tenta resolver via siteUrl (site público) primeiro, a menos que a URL seja do tipo /d/<siteId> (caso em que iremos direto via Drive)
  // Dentro do loader...
  // Tenta resolver via siteUrl (site público) primeiro...
  let html: string | null = null;
  if (siteUrlNorm && !siteIdFromSiteUrl) {
    try {
      const r = await fetch(siteUrlNorm, { redirect: "follow" });
      if (r.ok) {
        const maybeHtml = await r.text();
        const finalUrl = r.url ?? siteUrlNorm; // Obtém a URL final após redirects
        // Verifica se houve redirect para login (ex: accounts.google.com)
        const hadRedirectToLogin = finalUrl !== siteUrlNorm &&
          /accounts\.google\.com|ServiceLogin|signin/i.test(finalUrl);
        if (
          hadRedirectToLogin ||
          /sign-?in|login|accounts\.google\.com/i.test(maybeHtml)
        ) {
          // Detectado como privado via redirect ou conteúdo de login: ignora e vai para fallback
        } else {
          html = maybeHtml;
        }
      }
    } catch (_e) {
      // Ignora e cai para o fallback via Drive
    }
  }

  // Helper para extrair fileId de uma URL do Drive (se fornecida)
  const extractDriveFileId = (url: string): string | null => {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/, // https://drive.google.com/file/d/<id>/...
      /[?&]id=([a-zA-Z0-9_-]+)/, // https://drive.google.com/open?id=<id>
      /\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/, // https://sites.google.com/d/<id>/...
    ];
    for (const re of patterns) {
      const m = url.match(re);
      if (m) return m[1];
    }
    return null;
  };

  // Se não conseguiu via siteUrl (ou detectamos /d/<siteId>), tenta via Drive export (requer OAuth)
  if (!html) {
    const resolvedFileId = siteIdFromSiteUrl ??
      (fileUrlNorm ? extractDriveFileId(fileUrlNorm) : null) ??
      siteIdNorm;

    if (!resolvedFileId) {
      // Nova mensagem para URLs /view/ privadas
      if (siteUrlNorm?.includes("/view/")) {
        return {
          results: [],
          total: 0,
          page,
          pageSize,
          info:
            "Para sites privados com URLs /view/, forneça o siteId ou fileUrl, pois não é possível extrair o ID automaticamente da URL de visualização.",
        };
      }
      return {
        results: [],
        total: 0,
        page,
        pageSize,
        info:
          "Não foi possível resolver um fileId. Forneça um siteId (Drive), um fileUrl (Drive) ou uma siteUrl pública (ou no formato sites.google.com/d/<siteId>/...).",
      };
    }

    const response = await ctx.client["GET /drive/v3/files/:fileId/export"]({
      fileId: resolvedFileId,
      mimeType: "text/html",
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      let infoMessage = "Não foi possível exportar o conteúdo via Drive.";
      if (response.status === 401 || response.status === 403) {
        infoMessage =
          "Falha de autenticação: verifique se o token de acesso OAuth está válido e se as permissões (drive.readonly) estão configuradas corretamente.";
      }
      return {
        results: [],
        total: 0,
        page,
        pageSize,
        info: infoMessage + (errBody ? ` Detalhes: ${errBody}` : ""),
      };
    }

    html = await response.text();
  }

  // 2. Parsear o HTML
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) {
    return {
      results: [],
      total: 0,
      page,
      pageSize,
      info: "Falha ao parsear o HTML.",
    };
  }

  doc.querySelectorAll("script, style").forEach((el) => {
    el._remove();
  });

  // Extrair texto plano: remover tags HTML e normalizar espaços
  const plainText = (doc.body.textContent || "").replace(/\s+/g, " ").trim();

  // Dividir em chunks de ~1000 caracteres
  const chunkSize = 1000;
  const allChunks: string[] = [];
  for (let i = 0; i < plainText.length; i += chunkSize) {
    let chunk = plainText.substring(i, i + chunkSize);
    chunk =
      `Instrução: Busque por '${query}' neste texto e extraia trechos relevantes. Texto: ` +
      chunk;
    allChunks.push(chunk);
  }

  // Paginação
  const total = allChunks.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedChunks = allChunks.slice(start, end);

  // Converter para SearchResult
  const results: SearchResult[] = paginatedChunks.map((chunk, index) => ({
    pageTitle: `Chunk ${index + 1} do Site`,
    relevantSnippet: chunk,
  }));

  return {
    results,
    total,
    page,
    pageSize,
  };
};

export default loader;
