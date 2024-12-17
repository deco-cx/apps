export interface PDPReview {
  reviews: ProductReview[];
  composition: Composition[];
  customerSettings: CustomerSettings;
}

export interface ProductReview {
  _id: string;
  aggregateRating: number;
  recommendedPercentage: number;
  reviewCount: number;
  reviews: UserReview[];
}

export interface UserReview {
  _id: string;
  customer: string;
  sku: string;
  name: string;
  text: string;
  rating: number;
  helpful: number;
  unhelpful: number;
  verified: boolean;
  created: string;
  status: string;
  recommended: boolean;
  updated: string;
  pictures?: Picture[];
}

export interface Picture {
  _id: string;
  url: string;
}

export interface Composition {
  _id: number;
  count: number;
}

export interface CustomerSettings {
  minStarsHighlightPDP: number;
}

export interface WriteReview {
  userId: string;
  email: string;
  rating: number;
  text: string;
  recommended: boolean;
}

export interface ResponseWriteReview {
  helpful: number;       // Quantidade de votos úteis para a avaliação
  unhelpful: number;     // Quantidade de votos não úteis para a avaliação
  verified: boolean;     // Indica se a compra foi verificada
  status: string;        // Status da avaliação (ex.: "sent")
  _id: string;           // Identificador único da avaliação
  created: string;       // Data de criação da avaliação (formato ISO)
  customer: string;      // Identificador do cliente (ex.: "tokstok")
  userId: string;        // Identificador único do usuário
  name: string;          // Nome do autor da avaliação
  sku: string;           // Identificador SKU do produto avaliado
  text: string;          // Texto da avaliação
  recommended: boolean;  // Indica se o produto foi recomendado
  rating: number;        // Nota de avaliação do produto (ex.: 5)
}