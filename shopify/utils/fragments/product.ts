import { gql } from "../../../utils/graphql.ts";
import { Image, Media, Option, PriceRange, SEO } from "../types.ts";
import {
  Fragment as Variant,
  fragment as ProductVariantFragment,
} from "./productVariant.ts";

export interface Fragment {
  availableForSale: boolean;
  createdAt: string;
  description: string;
  descriptionHtml: string;
  featuredImage: Image;
  handle: string;
  id: string;
  images: { nodes: Image[] };
  isGiftCard: boolean;
  media: Media;
  onlineStoreUrl: null;
  options: Option[];
  priceRange: PriceRange;
  productType: string;
  publishedAt: string;
  requiresSellingPlan: boolean;
  seo: SEO;
  tags: string[];
  title: string;
  totalInventory: number;
  updatedAt: string;
  variants: { nodes: Variant[] };
  vendor: string;
}

export const fragment = gql`on Product {
  availableForSale
  createdAt
  description
  descriptionHtml
  featuredImage {
    altText
    url
  }
  handle
  id
  images(first: 10) {
    nodes {
      altText
      url
    }
  }
  isGiftCard
  media(first: 10) {
    nodes {
      alt
      previewImage {
        altText
        url
      }
      mediaContentType
    }
  }
  onlineStoreUrl
  options {
    name
    values
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  productType
  publishedAt
  requiresSellingPlan
  seo {
    title
    description
  }
  tags
  title
  totalInventory
  updatedAt
  variants(first: 10) {
    nodes {
      ...${ProductVariantFragment}
    }
  }
  vendor
}
`;
