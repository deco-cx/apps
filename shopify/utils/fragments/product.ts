import { gql } from "../../utils/gql.ts";
import { productVariantFragment } from "../../utils/fragments/productVarian.ts";

export const productFragment = gql`
fragment ProductFragment on Product {
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
      ...ProductVariantFragment
    }
  }
  vendor
}
` + productVariantFragment;
