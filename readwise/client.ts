// Types for the Readwise API

// Basic tag type
export interface Tag {
  id: number;
  name: string;
}

// Highlight type shared across the API
export interface Highlight {
  id: number;
  text: string;
  note: string | null;
  location: number;
  location_type: "order" | "page" | "time_offset";
  highlighted_at: string | null;
  url: string | null;
  color: string;
  updated: string;
  book_id: number;
  tags: Tag[];
  is_favorite?: boolean;
  is_discard?: boolean;
  end_location?: number | null;
  external_id?: string | null;
  highlight_url?: string | null;
  readwise_url?: string;
}

// Book type
export interface Book {
  id: number;
  title: string;
  author: string | null;
  category: "books" | "articles" | "tweets" | "podcasts";
  source: string;
  num_highlights: number;
  last_highlight_at: string | null;
  updated: string;
  cover_image_url: string;
  highlights_url: string;
  source_url: string | null;
  asin: string | null;
  tags: Tag[];
  document_note: string;
}

// Pagination response wrapper
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Export response types
export interface ExportResult {
  count: number;
  nextPageCursor: string | null;
  results: ExportResultItem[];
}

export interface ExportResultItem {
  user_book_id: number;
  is_deleted: boolean;
  title: string;
  author: string | null;
  readable_title: string;
  source: string;
  cover_image_url: string;
  unique_url: string;
  book_tags: Tag[];
  category: string;
  document_note: string;
  summary: string;
  readwise_url: string;
  source_url: string;
  asin: string | null;
  highlights: ExportHighlight[];
}

export interface ExportHighlight {
  id: number;
  is_deleted: boolean;
  text: string;
  location: number;
  location_type: string;
  note: string | null;
  color: string;
  highlighted_at: string;
  created_at: string;
  updated_at: string;
  external_id: string | null;
  end_location: number | null;
  url: string | null;
  book_id: number;
  tags: Tag[];
  is_favorite: boolean;
  is_discard: boolean;
  readwise_url: string;
}

// Daily Review response
export interface DailyReviewResponse {
  review_id: number;
  review_url: string;
  review_completed: boolean;
  highlights: DailyReviewHighlight[];
}

export interface DailyReviewHighlight {
  text: string;
  title: string;
  author: string | null;
  url: string | null;
  source_url: string | null;
  source_type: string;
  category: string | null;
  location_type: string;
  location: number;
  note: string | null;
  highlighted_at: string;
  highlight_url: string | null;
  image_url: string;
  id: number;
  api_source: string | null;
}

// Highlight create payload
export interface HighlightItem {
  text: string;
  title?: string;
  author?: string;
  image_url?: string;
  source_url?: string;
  source_type?: string;
  category?: "books" | "articles" | "tweets" | "podcasts";
  note?: string;
  location?: number;
  location_type?: "page" | "order" | "time_offset";
  highlighted_at?: string;
  highlight_url?: string;
}

export interface HighlightCreatePayload {
  highlights: HighlightItem[];
}

export interface HighlightCreateResponse {
  id: number;
  title: string;
  author: string | null;
  category: string;
  source: string;
  num_highlights: number;
  last_highlight_at: string | null;
  updated: string;
  cover_image_url: string;
  highlights_url: string;
  source_url: string | null;
  modified_highlights: number[];
}

// Highlight update payload
export interface HighlightUpdatePayload {
  text?: string;
  note?: string;
  location?: number;
  url?: string;
  color?: string;
}

// Client interface for the Readwise API
export interface ReadwiseClient {
  // Auth check (returns 204 if successful)
  "GET /auth/": {
    response: void;
  };

  // Highlight endpoints
  "GET /highlights/": {
    response: PaginatedResponse<Highlight>;
    searchParams?: {
      page_size?: number;
      page?: number;
      book_id?: number;
      updated__lt?: string;
      updated__gt?: string;
      highlighted_at__lt?: string;
      highlighted_at__gt?: string;
    };
  };

  "GET /highlights/:id": {
    response: Highlight;
  };

  "PATCH /highlights/:id": {
    response: Highlight;
    body: HighlightUpdatePayload;
  };

  "DELETE /highlights/:id": {
    response: void;
  };

  "POST /highlights/": {
    response: HighlightCreateResponse[];
    body: HighlightCreatePayload;
  };

  // Book endpoints
  "GET /books/": {
    response: PaginatedResponse<Book>;
    searchParams?: {
      page_size?: number;
      page?: number;
      category?: string;
      source?: string;
      updated__lt?: string;
      updated__gt?: string;
      last_highlight_at__lt?: string;
      last_highlight_at__gt?: string;
    };
  };

  "GET /books/:id": {
    response: Book;
  };

  // Export endpoint
  "GET /export/": {
    response: ExportResult;
    searchParams?: {
      updatedAfter?: string;
      ids?: string;
      pageCursor?: string;
    };
  };

  // Daily review endpoint
  "GET /review/": {
    response: DailyReviewResponse;
  };

  // Tag endpoints
  "GET /highlights/:highlight_id/tags": {
    response: PaginatedResponse<Tag>;
    searchParams?: {
      page_size?: number;
      page?: number;
    };
  };

  "POST /highlights/:highlight_id/tags": {
    response: Tag;
    body: { name: string };
  };

  "GET /books/:book_id/tags": {
    response: PaginatedResponse<Tag>;
    searchParams?: {
      page_size?: number;
      page?: number;
    };
  };

  "POST /books/:book_id/tags": {
    response: Tag;
    body: { name: string };
  };
}
