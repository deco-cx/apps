import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";
import type { ExtractedLink } from "../utils/types.ts";

export interface Props {
  /**
   * @title URL do Google Sites
   * @description URL completa do site (ex.: https://sites.google.com/view/<slug>/home). Para sites públicos, o conteúdo será resolvido automaticamente por esta URL. Também detecta URLs no formato 'https://sites.google.com/d/<siteId>/p/<pageId>/edit' e extrai automaticamente o siteId para usar a exportação do Drive (ideal para sites privados).
   */
  siteUrl?: string;
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
// Dentro da função `loader`
const loader = async (
  props: Props,
  _req: Request,
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
    siteUrl,
    page = 1,
    pageSize = 50,
    format = "json",
  } = props;

  // Normalização: remove espaços extras e aspas/crases ao redor
  const normalize = (s?: string) =>
    s?.trim().replace(/^['"`]\s*|\s*['"`]$/g, "");
  const siteUrlNorm = normalize(siteUrl);

  if (!siteUrlNorm) {
    const info =
      "Forneça pelo menos um dos parâmetros: siteUrl (público), fileUrl (Drive) ou siteId (Drive).";
    return format === "csv"
      ? { csv: "", total: 0, page, pageSize, info }
      : { links: [], total: 0, page, pageSize, info };
  }

  // Tenta resolver via siteUrl (site público) primeiro, a menos que a URL seja do tipo /d/<siteId> (caso em que iremos direto via Drive)
  let html: string | null = null;

  if (siteUrlNorm) {
    try {
      const r = await fetch(siteUrlNorm, { redirect: "follow" });
      if (r.ok) {
        html = await r.text();
      }
    } catch (_e) {
      // Ignora e cai para o fallback via Drive
    }
  }

  // 2. Parsear o HTML
  const doc = html ? new DOMParser().parseFromString(html, "text/html") : null;
  if (!doc) {
    const info =
      "Falha ao parsear o HTML do site. O arquivo pode não ser exportável como 'text/html'.";
    return format === "csv"
      ? { csv: "", total: 0, page, pageSize, info }
      : { links: [], total: 0, page, pageSize, info };
  }

  const links: ExtractedLink[] = [];
  const anchorTags = doc.querySelectorAll("a");

  // Evitar duplicados
  const seen = new Set<string>();

  // 3. Iterar sobre todas as tags <a> e extrair as informações
  for (const a of anchorTags) {
    const el = a as unknown as Element; // Cast seguro
    const rawHref = el.getAttribute("href") || "";
    const href = rawHref.trim();

    // Ignorar âncoras e links inválidos (não iniciam com http/https)
    if (!href || href.startsWith("#") || !/^https?:\/\//i.test(href)) {
      continue;
    }

    // Ignorar duplicados
    if (seen.has(href)) continue;
    seen.add(href);

    links.push({
      anchorText: (el.textContent ?? "").trim(),
      linkUrl: href,
      // Com o filtro acima, links relativos já ficam de fora; considera interno se for do domínio do Google Sites
      isInternal: href.includes("sites.google.com"),
    });
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
