export const normalize = (s?: string) =>
  s?.trim().replace(/^['"\`]\s*|\s*['"\`]$/g, "");

// Função para validar se uma URL é do Google Sites
export const isValidGoogleSitesUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);

    // Verificar se o domínio é sites.google.com
    if (urlObj.hostname !== "sites.google.com") {
      return false;
    }

    // Padrões válidos para Google Sites
    const validPatterns = [
      // URLs públicas: /view/<slug> ou /view/<slug>/<page>
      /^\/view\/[a-zA-Z0-9_-]+(?:\/[^/]*)?$/,
      // URLs privadas: /d/<siteId> ou /d/<siteId>/p/<pageId>/edit
      /^\/(?:u\/\d+\/)?d\/[a-zA-Z0-9_-]+(?:\/p\/[a-zA-Z0-9_-]+(?:\/edit)?)?$/,
    ];

    return validPatterns.some((pattern) => pattern.test(urlObj.pathname));
  } catch {
    return false;
  }
};

export const DOM_CLEANUP_SELECTORS = [
  "script",
  "style",
  "header",
  "footer",
  "nav",
  ".sites-header",
  ".sites-navigation",
  '[role="banner"]',
  '[role="contentinfo"]',
  '[role="navigation"]',
  '[aria-label="Search this site"]',
  '[aria-label="Skip to main content"]',
  ".goog-inline-block",
  ".sites-embed",
  '[id*="toolbar"]',
  '[id*="footer"]',
  '[class*="report-abuse"]',
].join(", ");

export const PT_STOP_WORDS = new Set<string>([
  "a",
  "o",
  "os",
  "as",
  "um",
  "uma",
  "uns",
  "umas",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "d",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "por",
  "para",
  "pra",
  "p",
  "per",
  "pelos",
  "pelo",
  "pelas",
  "pela",
  "ao",
  "aos",
  "à",
  "às",
  "e",
  "ou",
  "com",
  "sem",
  "sob",
  "sobre",
  "entre",
  "que",
  "se",
  "sua",
  "seu",
  "suas",
  "seus",
  "meu",
  "minha",
  "meus",
  "minhas",
  "teu",
  "tua",
  "teus",
  "tuas",
  "este",
  "esta",
  "estes",
  "estas",
  "esse",
  "essa",
  "esses",
  "essas",
  "aquele",
  "aquela",
  "aqueles",
  "aquelas",
  "isto",
  "isso",
  "aquilo",
  "um",
  "uma",
  "uns",
  "umas",
  "já",
  "não",
  "nao",
  "mais",
  "menos",
  "também",
  "tambem",
  "como",
  "quando",
  "onde",
  "porque",
  "porquê",
  "pois",
]);
