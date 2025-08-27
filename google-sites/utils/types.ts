export interface ExtractedLink {
  anchorText: string;
  linkUrl: string;
  isInternal: boolean;
}

export interface SearchResult {
  pageTitle: string;
  /** O trecho de texto mais relevante onde a busca foi encontrada. */
  relevantSnippet: string;
  /** O link original do site ou um identificador. */
  link?: string;
  /** Índice de relevância (opcional). */
  score?: number;
}
