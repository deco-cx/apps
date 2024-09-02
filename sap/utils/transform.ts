import type {
  BreadcrumbList,
  Filter,
  ImageObject,
  ListItem,
  Product as CommerceProduct,
  SiteNavigationElement,
} from "../../commerce/types.ts";
import {
  Breadcrumb,
  Category,
  FacetResponse,
  Pagination,
  Product,
} from "./types.ts";

function nodeToNavbar(node: Category): SiteNavigationElement {
  const url = new URL(node.url, "https://example.com");

  return {
    "@type": "SiteNavigationElement",
    url: `${url.pathname}${url.search}`,
    name: node.name,
    children: node.subcategories.map(nodeToNavbar),
  };
}

export const categoryTreeToNavbar = (
  tree: Category[],
): SiteNavigationElement[] => tree.map(nodeToNavbar);

export const convertCategoriesToBreadcrumb = (
  categories: Category[],
): BreadcrumbList => {
  const list: ListItem[] = categories.map((category, index) => {
    return {
      "@type": "ListItem",
      item: category.name,
      position: index,
      url: category.url,
    };
  });

  return {
    "@type": "BreadcrumbList",
    itemListElement: list,
    numberOfItems: categories.length,
  };
};

export const convertBreadcrumb = (
  breadcrumbs: Breadcrumb[],
): BreadcrumbList => {
  const list: ListItem[] = breadcrumbs.map((item, index) => {
    return {
      "@type": "ListItem",
      item: item.facetValueName,
      position: index,
      url: `/${item.facetValueCode}`,
    };
  });

  return {
    "@type": "BreadcrumbList",
    itemListElement: list,
    numberOfItems: breadcrumbs.length,
  };
};

export const convertProductData = (
  product: Product,
): CommerceProduct => {
  const images: ImageObject[] = product.images.map((image) => ({
    "@type": "ImageObject",
    description: image.altText,
    encodingFormat: image.format,
    url: image.url,
    thumbnailUrl: image.url,
  }));

  return {
    "@type": "Product",
    additionalProperty: [], // TODO: Need to organize the products data like dimensions, manuals, features, etc.
    aggregateRating: { // TODO: It seems like Frigidaire use the product reviews from another database
      "@type": "AggregateRating",
      ratingCount: product.numberOfReviews,
      reviewCount: product.numberOfReviews,
      ratingValue: 0,
      bestRating: 0,
      worstRating: 0,
      ratingExplanation: "",
    },
    category: product.categories[0]?.name,
    description: product.summary,
    // isRelatedTo: [product.], // TODO
    image: images,
    offers: {
      "@type": "AggregateOffer",
      highPrice: product.price.value,
      lowPrice: product.price.value,
      offerCount: 1,
      offers: [{
        "@type": "Offer",
        availability: product.purchasable
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        inventoryLevel: {
          value: product.stock.stockLevel,
        },
        price: product.price.value,
        priceCurrency: product.price.currencyIso,
        priceSpecification: [
          {
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/ListPrice",
            price: product.price.value,
          },
        ],
      }],
      priceCurrency: product.price.currencyIso,
    },
    name: product.name,
    productID: product.code,
    sku: "",
    url: product.url,
  };
};

export const getPreviousNextPagination = (pagination: Pagination): string[] => {
  const previousPage = pagination.currentPage > 0
    ? pagination.currentPage - 1
    : undefined;
  const nextPage = pagination.currentPage + 1 < pagination.totalPages
    ? pagination.currentPage + 1
    : undefined;

  return [previousPage, nextPage].map(toString);
};

export const convertFacetsToFilters = (facets: FacetResponse[]): Filter[] => {
  const filters: Filter[] = facets.map((facet) => {
    return {
      "@type": "FilterToggle",
      label: facet.name,
      key: facet.priority.toString(),
      values: facet.values.map((value) => {
        return {
          quantity: value.count,
          label: value.name,
          value: value.name,
          selected: value.selected,
          url: value.query.url,
        };
      }),
      quantity: facet.values.length,
    };
  });

  return filters;
};
