import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";
import { AppContext } from "../mod.ts";
import type { CloudSearchResponse } from "../utils/client.ts";
import { normalize, PT_STOP_WORDS } from "../utils/helpers.ts";
import type { SearchResult } from "../utils/types.ts";

export interface Props {
  /**
   * @title URL pública do Google Sites
   * @description URL completa do site
   */
  siteUrl?: string;
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
  /**
   * @title Search Application ID (opcional)
   * @description Caso o ID do contexto esteja ausente/inválido, você pode informar aqui (ex.: searchapplications/1234567890). Se não informado, tentaremos o valor 'default'.
   */
  searchApplicationId?: string;
}

/**
 * Normaliza uma URL para garantir consistência.
 * @param url A URL a ser normalizada.
 * @returns A URL normalizada.
 */
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = "https://" + normalized;
  }
  if (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

/**
 * Cria um trecho de texto (snippet) ao redor do termo encontrado.
 * @param text O texto completo.
 * @param index O índice onde o termo foi encontrado.
 * @param termLength O tamanho do termo de busca.
 * @returns Um snippet formatado.
 */
function createSnippet(
  text: string,
  index: number,
  termLength: number,
): string {
  const context = 80; // Quantos caracteres antes e depois mostrar
  const start = Math.max(0, index - context);
  const end = Math.min(text.length, index + termLength + context);

  let snippet = text.substring(start, end);

  if (start > 0) {
    snippet = "... " + snippet;
  }
  if (end < text.length) {
    snippet = snippet + " ...";
  }
  return snippet;
}

/**
 * Extrai links de um conteúdo HTML usando Regex.
 * @param html O conteúdo HTML.
 * @param baseUrl A URL base para resolver links relativos.
 * @returns Um array de URLs absolutas.
 */
function extractLinksFromHtml(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (doc) {
      const base = new URL(baseUrl);
      const anchors = doc.querySelectorAll("a[href]");

      for (const a of anchors) {
        const href = (a as unknown as Element).getAttribute?.("href");
        if (!href) continue;
        try {
          const absoluteUrl = new URL(href, base).toString();
          const clean = sanitizeUrlString(absoluteUrl.split("#")[0]);
          links.add(clean);
        } catch { /* ignore */ }
      }
      if (links.size > 0) {
        return Array.from(links);
      }
    }
  } catch (e) {
    console.warn(
      "[extractLinksFromHtml] parser error, falling back to regex:",
      e,
    );
  }

  // Fallback regex
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
  let match;
  let regexMatches = 0;
  while ((match = linkRegex.exec(html)) !== null) {
    regexMatches++;
    const href = match[2];
    if (!href) continue;
    try {
      const absoluteUrl = new URL(href, baseUrl).toString();
      const clean = sanitizeUrlString(absoluteUrl.split("#")[0]);
      links.add(clean);
    } catch { /* ignore */ }
  }

  return Array.from(links);
}

/**
 * Decodifica entidades HTML comuns
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Limpa o HTML removendo tags, scripts, styles e decodificando entidades
 * usando Regex, retornando apenas o texto.
 * @param html O conteúdo HTML.
 * @returns O texto limpo.
 */
function cleanHtmlAndGetText(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    if (doc) {
      const junk = doc.querySelectorAll("script,style,noscript");
      for (const el of junk) {
        // garantir separação ao remover lixo
        if (typeof ((el as unknown) as Element).replaceWith === "function") {
          (el as unknown as HTMLElement).replaceWith(" ");
        } else {
          const parent = (el as unknown as Element).parentNode;
          try {
            if (parent && (doc as unknown as Document).createTextNode) {
              parent.insertBefore(
                (doc as unknown as Document).createTextNode(" "),
                el as unknown as Node,
              );
            }
          } catch { /* ignore */ }
          ((el as unknown) as Element).remove?.();
        }
      }

      // Transformar HTML restante em texto, garantindo espaços entre tags
      const bodyHtml = ((doc as unknown as Document).body?.innerHTML ??
        ((doc as unknown as Document).documentElement?.innerHTML) ??
        html) as string;

      let text = bodyHtml
        .replace(/<br\s*\/?>/gi, " ")
        .replace(
          /<\/?(p|div|section|article|header|footer|nav|li|ul|ol|h[1-6]|table|thead|tbody|tfoot|tr|td|th|blockquote|pre)[^>]*>/gi,
          " ",
        )
        .replace(/<[^>]+>/g, " ");
      text = decodeHtmlEntities(text);

      const stripped = stripBoilerplate(text.replace(/\s\s+/g, " ").trim());
      const collapsed = collapseRepeatedPhrases(stripped);

      // NOVO: deduplicar sentenças/chunks repetidos ao longo do texto
      const deduped = dedupeRepeatedChunks(collapsed);
      return deduped;
    }
  } catch (e) {
    console.warn(
      "[cleanHtmlAndGetText] parser error, falling back to regex:",
      e,
    );
  }

  // Fallback (também garantindo espaços)
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<br\s*\/?>/gi, " ");
  text = text.replace(
    /<\/?(p|div|section|article|header|footer|nav|li|ul|ol|h[1-6]|table|thead|tbody|tfoot|tr|td|th|blockquote|pre)[^>]*>/gi,
    " ",
  );
  text = text.replace(/<[^>]+>/g, " ");
  text = decodeHtmlEntities(text);
  const stripped = stripBoilerplate(text.replace(/\s\s+/g, " ").trim());
  const collapsed = collapseRepeatedPhrases(stripped);

  // NOVO: deduplicação também no fallback
  const deduped = dedupeRepeatedChunks(collapsed);
  return deduped;
}

/**
 * Normaliza um snippet para deduplicação (remove pontuação, normaliza case e espaços)
 */
function normalizeSnippet(snippet: string): string {
  return snippet
    .toLowerCase()
    // remove pontuação (unicode)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetch com timeout para evitar pendurar em páginas lentas
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 8000, ...opts } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });

    return res;
  } catch (err) {
    const duration = Date.now() - startedAt;
    if ((err as Error)?.name === "AbortError") {
      console.warn(
        `[fetchWithTimeout] ABORTED ${url} after ${duration}ms (timeout=${timeoutMs}ms)`,
      );
    } else {
      console.error(`[fetchWithTimeout] ERROR ${url} after ${duration}ms`, err);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Executa map assíncrono com limite de concorrência
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let i = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (true) {
        const current = i++;
        if (current >= items.length) break;
        results[current] = await mapper(items[current], current);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

/**
 * Formata resultados do Cloud Search API para o padrão SearchResult
 */
function formatCloudSearchResults(
  response: CloudSearchResponse,
): SearchResult[] {
  if (!response.results) return [];

  return response.results.map((item) => ({
    pageTitle: item.title,
    relevantSnippet: item.snippet,
    link: item.link,
    score: 1,
  }));
}

function sanitizeUrlString(u: string): string {
  return u.trim().replace(/^`+|`+$/g, "");
}

function stripBoilerplate(text: string): string {
  const patterns = [
    /skip to main content/gi,
    /skip to navigation/gi,
    /google sites/gi,
    /report abuse/gi,
    /page details/gi,
    /page updated/gi,
    /embedded files/gi,
    /\bmore\b/gi,
    /search this site/gi,
    /\bmais\b/gi,
    /\bmenu\b/gi,
    /\bhome\b/gi,
    /\bp[áa]gina inicial\b/gi,
    /\bin[íi]cio\b/gi,
    /\bnavega[cç][aã]o\b/gi,
  ];
  let t = text;
  for (const p of patterns) t = t.replace(p, " ");
  return t.replace(/\s\s+/g, " ").trim();
}

function collapseRepeatedPhrases(text: string): string {
  // Remove repetições consecutivas de n-gramas (2 a 8 palavras)
  const words = text.split(/\s+/);
  if (words.length < 4) return text;

  const out: string[] = [];
  for (let i = 0; i < words.length;) {
    let collapsedLen = 0;
    const maxWindow = Math.min(8, Math.floor((words.length - i) / 2));
    for (let n = maxWindow; n >= 2; n--) {
      let repeated = true;
      for (let k = 0; k < n; k++) {
        if (
          (words[i + k] || "").toLowerCase() !==
            (words[i + n + k] || "").toLowerCase()
        ) {
          repeated = false;
          break;
        }
      }
      if (repeated) {
        // Mantém apenas a primeira ocorrência e pula a repetida
        for (let k = 0; k < n; k++) out.push(words[i + k]);
        collapsedLen = n;
        break;
      }
    }
    if (collapsedLen > 0) {
      i += collapsedLen * 2;
    } else {
      out.push(words[i]);
      i += 1;
    }
  }
  return out.join(" ").replace(/\s\s+/g, " ").trim();
}

function dedupeRepeatedChunks(text: string): string {
  const MIN_CHUNK_LEN = 25; // só deduplica trechos mais longos
  const seen = new Set<string>();
  const out: string[] = [];

  // Marca pontuação de término e depois faz split por marcador ou quebra de linha
  const marked = text.replace(/([\.!\?;:])\s+/g, "$1|");
  const candidates = marked.split(/\|+|[\n\r]+/g).filter(Boolean);

  for (const part of candidates) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // evita deduplicar pedaços curtos (listas, palavras repetidas etc.)
    if (trimmed.length < MIN_CHUNK_LEN) {
      out.push(trimmed);
      continue;
    }

    // normaliza para comparação robusta
    const norm = normalizeSnippet(trimmed);
    if (!seen.has(norm)) {
      seen.add(norm);
      out.push(trimmed);
    }
  }

  return out.join(" ").replace(/\s\s+/g, " ").trim();
}

function tokenizeQuery(query: string): string[] {
  const lowered = query.toLowerCase();
  // separa por não letras/números (unicode)
  const rawTokens = lowered.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  // filtra stopwords e tokens muito curtos
  const tokens = rawTokens.filter((t) =>
    !PT_STOP_WORDS.has(t) && t.length >= 2
  );
  // dedup
  return Array.from(new Set(tokens));
}

/**
 * Busca usando Google Custom Search API
 */
async function searchWithCustomSearch(
  query: string,
  siteUrl: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<
  {
    results: SearchResult[];
    total: number;
    isPrivate?: boolean;
    invalidSite?: boolean;
  }
> {
  try {
    // 1. Fazer o fetch da página inicial e tratar erros primários
    let initialResponse;
    try {
      initialResponse = await fetchWithTimeout(siteUrl, {
        headers: { "User-Agent": "SimpleBot/1.0" },
        timeoutMs: 8000,
      });
    } catch (error) {
      console.error(
        `[CustomSearch] network error accessing ${siteUrl}:`,
        error,
      );
      return { results: [], total: 0, invalidSite: true };
    }

    if (!initialResponse.ok) {
      console.warn(`[CustomSearch] initial status=${initialResponse.status}`);
      if (initialResponse.status === 401 || initialResponse.status === 403) {
        return { results: [], total: 0, isPrivate: true };
      }
      return { results: [], total: 0, invalidSite: true };
    }

    const initialHtml = await initialResponse.text();

    // 2. Extrair todos os links internos únicos da página inicial
    const allLinksExtracted = extractLinksFromHtml(initialHtml, siteUrl);

    const internalLinks = new Set<string>([siteUrl]);
    const baseUrl = new URL(siteUrl);

    let filteredOut = 0;
    for (const link of allLinksExtracted) {
      try {
        const urlObject = new URL(link);
        if (urlObject.hostname === baseUrl.hostname) {
          const cleanUrl = link.split("#")[0];
          if (
            !/\.(pdf|jpg|jpeg|png|gif|webp|zip|rar|css|js|svg|ico)$/i.test(
              cleanUrl,
            )
          ) {
            internalLinks.add(normalizeUrl(cleanUrl));
          } else {
            filteredOut++;
          }
        } else {
          filteredOut++;
        }
      } catch {
        filteredOut++;
      }
    }

    const MAX_PAGES = 50;
    const CONCURRENCY = 6;
    const PER_PAGE_SNIPPET_LIMIT = 5;

    const urlsToScrape = Array.from(internalLinks).slice(0, MAX_PAGES);

    // 3. Buscar o conteúdo com concorrência limitada
    const allMatches: SearchResult[] = [];
    const seenSnippets = new Set<string>();
    const perPageCount = new Map<string, number>();

    let tokens = tokenizeQuery(query);
    if (tokens.length === 0) {
      // fallback: se tudo for stopword, usa palavras com >=2 chars do original
      tokens = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((t) =>
        t.length >= 2
      );
      tokens = Array.from(new Set(tokens));
    }
    const tokensSet = new Set(tokens);
    await mapWithConcurrency(urlsToScrape, CONCURRENCY, async (url) => {
      try {
        const response = await fetchWithTimeout(url, {
          headers: { "User-Agent": "SimpleBot/1.0" },
          timeoutMs: 8000,
        });
        if (!response.ok) {
          console.warn(`[CustomSearch] ${url} -> ${response.status}`);
          return;
        }

        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const titleFromHtml = titleMatch
          ? decodeHtmlEntities(titleMatch[1].replace(/\s+/g, " ").trim())
          : undefined;

        const cleanText = cleanHtmlAndGetText(html);
        const textLower = cleanText.toLowerCase();
        const titleLower = (titleFromHtml || "").toLowerCase();

        // bônus por termos no título
        const titleTokenMatches = new Set(tokens.filter((t) =>
          titleLower.includes(t)
        )).size;

        let addedForUrl = 0;

        // procurar cada token no texto
        for (const t of tokens) {
          let fromIndex = 0;
          while (true) {
            if ((perPageCount.get(url) || 0) >= PER_PAGE_SNIPPET_LIMIT) break;

            const idx = textLower.indexOf(t, fromIndex);
            if (idx === -1) break;

            const snippet = createSnippet(cleanText, idx, t.length);
            const normalized = normalizeSnippet(snippet);

            if (normalized && !seenSnippets.has(normalized)) {
              // quantos termos distintos aparecem no snippet?
              const snippetLower = snippet.toLowerCase();
              const matchedTerms = new Set<string>();
              for (const tk of tokensSet) {
                if (snippetLower.includes(tk)) matchedTerms.add(tk);
              }
              const coverage = matchedTerms.size; // nº de termos distintos presentes
              const score = 1 + coverage + titleTokenMatches;

              allMatches.push({
                link: sanitizeUrlString(url),
                relevantSnippet: snippet,
                pageTitle: titleFromHtml || url.split("/").pop() || url,
                score,
              });
              seenSnippets.add(normalized);
              perPageCount.set(url, (perPageCount.get(url) || 0) + 1);
              addedForUrl++;
            }

            fromIndex = idx + 1;
          }
          if ((perPageCount.get(url) || 0) >= PER_PAGE_SNIPPET_LIMIT) break;
        }
      } catch (error) {
        console.error(`[CustomSearch] fail processing url=${url}:`, error);
      }
    });

    // Ordenar por score (desc) antes da paginação
    allMatches.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    // Deduplicar por URL (mantém o primeiro após a ordenação, ou seja, o de maior score)
    const uniqueByLink = new Map<string, SearchResult>();
    for (const r of allMatches) {
      const k = sanitizeUrlString(r.link || "");
      if (!uniqueByLink.has(k)) {
        uniqueByLink.set(k, { ...r, link: k });
      }
    }
    const deduped = Array.from(uniqueByLink.values());

    // 6. Paginar os resultados e retornar
    const total = deduped.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = deduped.slice(startIndex, endIndex);

    return { results: paginatedResults, total };
  } catch (error) {
    console.error("Custom Search Error:", error);
    return { results: [], total: 0, isPrivate: true };
  }
}

/**
 * Busca usando Google Cloud Search API (para sites privados)
 */
async function searchWithCloudSearch(
  ctx: AppContext,
  query: string,
  siteUrl?: string,
  start: number = 0,
  pageSize: number = 10,
  // Novo: permitir override vindo do prompt do loader
  overrideSearchApplicationId?: string,
): Promise<
  {
    results: SearchResult[];
    total: number;
    unavailable?: boolean;
    info?: string;
  }
> {
  try {
    // Primeiro, tentar com corpus (mais direto para sites específicos)
    if (siteUrl) {
      try {
        const domain = new URL(siteUrl).hostname;
        const corpusBody = {
          query,
          pageSize,
          start,
          corpus: `datasources/${domain}`,
          requestOptions: {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };

        console.log("🔍 Tentando busca com corpus:", corpusBody);

        const corpusResponse = await ctx.cloudSearchClient["POST /v1/query/search"]("", {
          body: corpusBody,
        });

        if (!("error" in corpusResponse)) {
          console.log("✅ Sucesso com corpus!");
          const results = formatCloudSearchResults(corpusResponse as CloudSearchResponse);
          const total = (corpusResponse as CloudSearchResponse).searchInformation
            ? parseInt(
              (corpusResponse as CloudSearchResponse).searchInformation?.totalResults ||
                "0",
            )
            : results.length;

          return { results, total };
        } else {
          const err = corpusResponse.error as { code?: number; message?: string };
          console.log("❌ Corpus falhou:", err.message);
          // Se erro não for relacionado ao corpus/corpo de dados, não tentar searchApplicationId
          if (err.code !== 403 && err.code !== 404) {
            throw new Error(`Cloud Search API Error: ${err.message}`);
          }
        }
      } catch (corpusError) {
        console.log("❌ Erro ao tentar corpus:", corpusError);
      }
    }

    // Fallback: tentar com searchApplicationId
    const body: {
      query: string;
      pageSize: number;
      start: number;
      dataSourceRestrictions?: Array<{
        source: {
          name: string;
        };
      }>;
      requestOptions?: {
        searchApplicationId?: string;
        timeZone?: string;
      };
    } = {
      query,
      pageSize,
      start,
    };

    // Determinar o ID efetivo seguindo a prioridade: contexto -> prompt -> 'default'
    const ctxSearchApplicationId =
      (ctx as unknown as { searchApplicationId?: string })?.searchApplicationId;

    let effectiveSearchApplicationId =
      ctxSearchApplicationId && ctxSearchApplicationId.trim()
        ? ctxSearchApplicationId.trim()
        : undefined;

    if (!effectiveSearchApplicationId) {
      if (overrideSearchApplicationId && overrideSearchApplicationId.trim()) {
        effectiveSearchApplicationId = overrideSearchApplicationId.trim();
      } else {
        // fallback final requerido
        effectiveSearchApplicationId = "default";
      }
    }

    // Define requestOptions com o ID efetivo e fuso horário
    body.requestOptions = {
      searchApplicationId: effectiveSearchApplicationId,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Se temos URL do site, adicionar restrição de domínio
    if (siteUrl) {
      const domain = new URL(siteUrl).hostname;
      body.dataSourceRestrictions = [{
        source: {
          name: `datasources/${domain}`,
        },
      }];
    }

    console.log("🔍 Tentando busca com searchApplicationId:", body);

    const response = await ctx.cloudSearchClient["POST /v1/query/search"]("", {
      body,
    });

    if ("error" in response) {
      const err = response.error as {
        code?: number;
        message?: string;
        status?: string;
      };

      // Mensagem padrão de orientação
      const infoMsg =
        "Não foi possível usar o Google Cloud Search porque o Search Application ID está ausente ou inválido. " +
        "Peça ao time de TI/Admin do Google Workspace para enviar esse ID (Admin Console > Cloud Search > Search applications). " +
        "Você pode informar este valor no prompt deste loader usando o campo searchApplicationId: 'searchapplications/1234567890' " +
        "ou configurar no app. Observação: tentamos automaticamente o valor 'default' quando o ID não é informado.";

      // Cloud Search não disponível para contas pessoais (Google Workspace required)
      if (
        err.code === 403 &&
        (err.message?.includes("only available to G Suite users") ||
          err.status === "PERMISSION_DENIED")
      ) {
        return { results: [], total: 0, unavailable: true, info: infoMsg };
      }

      // Tratar erros de ID faltando/ inválido / não encontrado
      const msg = (err.message || "").toLowerCase();
      const isMissingId = err.code === 400 &&
        (msg.includes("search application id is required") ||
          msg.includes("required for the request"));
      const isInvalidOrNotFound = (err.code === 400 || err.code === 404) &&
        (msg.includes("invalid") ||
          msg.includes("not found") ||
          msg.includes("search application"));

      if (isMissingId || isInvalidOrNotFound) {
        console.warn("[CloudSearch] ID inválido/ausente:", err.message);
        return { results: [], total: 0, unavailable: true, info: infoMsg };
      }

      throw new Error(`Cloud Search API Error: ${err.message}`);
    }

    const results = formatCloudSearchResults(response as CloudSearchResponse);
    const total = (response as CloudSearchResponse).searchInformation
      ? parseInt(
        (response as CloudSearchResponse).searchInformation?.totalResults ||
          "0",
      )
      : results.length;

    return { results, total };
  } catch (error) {
    console.error("Cloud Search Error:", error);
    return { results: [], total: 0, unavailable: true };
  }
}

/**
 * @title Buscar conteúdo em um Google Site
 * @description Realiza uma busca textual no conteúdo do site usando Custom Search API primeiro, e Cloud Search API para sites privados
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  info?: string;
}> => {
  const { siteUrl, query, page = 1, pageSize = 10, searchApplicationId } =
    props;

  const siteUrlNorm = normalize(siteUrl);

  console.log("siteUrlNorm", siteUrlNorm);

  // Exigir pelo menos um identificador ou termo de busca
  if (!query.trim()) {
    return {
      results: [],
      total: 0,
      page,
      pageSize,
      info: "Termo de busca é obrigatório.",
    };
  }

  const start = (page - 1) * pageSize;

  let searchResults: {
    results: SearchResult[];
    total: number;
    isPrivate?: boolean;
  };
  let info: string | undefined;

  if (siteUrlNorm === "") {
    searchResults = {
      results: [],
      total: 0,
      isPrivate: true,
    };
  } else {
    // Tentar primeiro com Custom Search API
    searchResults = await searchWithCustomSearch(
      query,
      siteUrlNorm || "",
      start + 1,
      pageSize,
    );

    if ("invalidSite" in searchResults && searchResults.invalidSite) {
      return {
        results: [],
        total: 0,
        page,
        pageSize,
        info: "Site inválido. Verifique se a URL está correta.",
      };
    }
  }

  // Se Custom Search indicar site privado ou não retornar resultados, tentar Cloud Search
  if (
    searchResults.isPrivate ||
    (searchResults.results.length === 0 && searchResults.total === 0)
  ) {
    const cloudSearchResults = await searchWithCloudSearch(
      ctx,
      query,
      siteUrlNorm,
      start, // Cloud Search usa 0-based indexing
      pageSize,
      searchApplicationId, // Novo: override vindo do prompt do loader
    );

    searchResults = {
      results: cloudSearchResults.results,
      total: cloudSearchResults.total,
    };

    if (cloudSearchResults.unavailable) {
      info = cloudSearchResults.info ??
        "Cloud Search API não está disponível para contas pessoais. É necessário usar uma conta Google Workspace com o serviço Cloud Search habilitado e permissões de consulta.";
    } else if (cloudSearchResults.results.length > 0) {
      info = "Resultados obtidos via Cloud Search API (site privado)";
    } else {
      info =
        "Nenhum resultado encontrado. Verifique se o site está acessível e se as credenciais estão corretas.";
    }
  } else if (searchResults.results.length > 0) {
    info = "Resultados obtidos via Custom Search";
  }

  // Aplicar paginação nos resultados
  const paginatedResults = searchResults.results;

  return {
    results: paginatedResults,
    total: searchResults.total,
    page,
    pageSize,
    info,
  };
};

export default loader;
