import { AppContext } from "../mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";
import type { ExtractedLink } from "../utils/types.ts";

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
   * @title Página
   * @description Número da página de resultados (para paginação de links)
   * @default 1
   */
  page?: number;
  /**
   * @title Itens por página
   * @description Quantidade de links por página
   * @default 50
   */
  pageSize?: number;
  /**
   * @title Formato de saída
   * @description 'json' (objeto com lista de links) ou 'csv' (string CSV)
   * @default "json"
   */
  format?: "json" | "csv";
}

/**
 * @title Extrair todos os links de um Google Site
 * @description Varre o site e retorna uma lista estruturada de todos os links encontrados
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  | {
    links: ExtractedLink[];
    total: number;
    page: number;
    pageSize: number;
    info?: string;
  }
  | {
    csv: string;
    total: number;
    page: number;
    pageSize: number;
    info?: string;
  }
> => {
  const {
    siteId,
    siteUrl,
    fileUrl,
    page = 1,
    pageSize = 50,
    format = "json",
  } = props;

  // Normalização: remove espaços extras e aspas/crases ao redor
  const normalize = (s?: string) =>
    s?.trim().replace(/^['"`]\s*|\s*['"`]$/g, "");
  const siteIdNorm = normalize(siteId);
  const siteUrlNorm = normalize(siteUrl);
  const fileUrlNorm = normalize(fileUrl);

  if (!siteUrlNorm && !fileUrlNorm && !siteIdNorm) {
    const info =
      "Forneça pelo menos um dos parâmetros: siteUrl (público), fileUrl (Drive) ou siteId (Drive).";
    return format === "csv"
      ? { csv: "", total: 0, page, pageSize, info }
      : { links: [], total: 0, page, pageSize, info };
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
  let html: string | null = null;
  if (siteUrlNorm && !siteIdFromSiteUrl) {
    try {
      const r = await fetch(siteUrlNorm, { redirect: "follow" });
      if (r.ok) {
        html = await r.text();
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
      const info =
        "Não foi possível resolver um fileId. Forneça um siteId (Drive), um fileUrl (Drive) ou uma siteUrl pública (ou no formato sites.google.com/d/<siteId>/...).";
      return format === "csv"
        ? { csv: "", total: 0, page, pageSize, info }
        : { links: [], total: 0, page, pageSize, info };
    }

    const response = await ctx.client["GET /drive/v3/files/:fileId/export"]({
      fileId: resolvedFileId,
      mimeType: "text/html",
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      const info =
        `Falha ao buscar conteúdo do site. Status: ${response.status} ${response.statusText}. Para sites privados, use 'siteId' ou 'fileUrl'. Para sites públicos, forneça 'siteUrl'.`;
      return format === "csv"
        ? {
          csv: "",
          total: 0,
          page,
          pageSize,
          info: `${info} ${errBody}`.trim(),
        }
        : {
          links: [],
          total: 0,
          page,
          pageSize,
          info: `${info} ${errBody}`.trim(),
        };
    }

    html = await response.text();
  }

  // 2. Parsear o HTML
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) {
    const info =
      "Falha ao parsear o HTML do site. O arquivo pode não ser exportável como 'text/html'.";
    return format === "csv"
      ? { csv: "", total: 0, page, pageSize, info }
      : { links: [], total: 0, page, pageSize, info };
  }

  const links: ExtractedLink[] = [];
  const anchorTags = doc.querySelectorAll("a");

  // 3. Iterar sobre todas as tags <a> e extrair as informações
  for (const a of anchorTags) {
    const el = a as unknown as Element; // Cast seguro
    const href = el.getAttribute("href");
    if (href) {
      links.push({
        anchorText: (el.textContent ?? "").trim(),
        linkUrl: href,
        isInternal: href.startsWith("/") || href.includes("sites.google.com"),
      });
    }
  }

  // 4. Paginação
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = links.slice(start, end);

  // 5. CSV opcional
  if (format === "csv") {
    const header = ["anchorText", "linkUrl", "isInternal"];
    const escape = (v: string) =>
      `"${v.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
    const rows = paginated.map((l) =>
      [escape(l.anchorText), escape(l.linkUrl), l.isInternal ? "true" : "false"]
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");

    return {
      csv,
      total: links.length,
      page,
      pageSize,
    };
  }

  return {
    links: paginated,
    total: links.length,
    page,
    pageSize,
  };
};

export default loader;
