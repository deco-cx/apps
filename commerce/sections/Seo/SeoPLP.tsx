import Seo, { Props as SeoProps } from "../../../website/components/Seo.tsx";
import { ProductListingPage, ProductListingPageListItem } from "../../types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/canonical.ts";

export type Props = {
  jsonLD: ProductListingPage | null;
} & Partial<Omit<SeoProps, "jsonLDs">>;

/**
 * @deprecated true
 * @migrate commerce/sections/Seo/SeoPLPV2.tsx
 * @title SeoPLP deprecated
 */
function Section({ jsonLD, ...props }: Props) {
  const title = jsonLD?.seo?.title;
  const description = jsonLD?.seo?.description;
  const canonical = props.canonical
    ? props.canonical
    : jsonLD?.seo?.canonical
      ? jsonLD.seo.canonical
      : jsonLD?.breadcrumb
        ? canonicalFromBreadcrumblist(jsonLD?.breadcrumb)
        : undefined;

  const noIndexing = props.noIndexing ||
    jsonLD?.seo?.noIndexing ||
    !jsonLD ||
    !jsonLD.products.length;


  function sanitizeObj<T>(obj: T): T {
    const propsToRemove = [
      "additionalProperty",
      "isVariantOf",
      "image",
      "teasers",
      "priceSpecification",
      "inProductGroupWithID",
      "sellerName",
      "inventoryLevel",
      "sellerDefault",
      "giftSkuIds",
      "priceValidUntil",
    ];

    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObj(item)) as T;
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([key]) => !propsToRemove.includes(key))
          .map(([key, value]) => [key, sanitizeObj(value)])
      ) as T;
    }

    return obj;
  }

  function formatProductListing(data: ProductListingPage | null) {
    if (!data) return null;

    const itemListElement: ProductListingPageListItem[] = data.products.reduce((accu: ProductListingPageListItem[], product, index) => {
      accu.push({
        "@type": "ListItem",
        position: index + 1,
        item: sanitizeObj(product)
      });
      return accu;
    }, []);

    return {
      "@type": "ItemList",
      "itemListElement": itemListElement
    };
  }

  function formatBreadCrumb(data: ProductListingPage | null) {
    if (!data) return null;

    return {
      "@type": "BreadcrumbList",
      "itemListElement": data.breadcrumb
    };
  }

  function formatNewJsonLd(data: ProductListingPage | null) {
    const items = [formatProductListing(data), formatBreadCrumb(data)].filter((item) => item !== null && item !== undefined);

    return [{...items, pageInfo: jsonLD?.pageInfo, seo: jsonLD?.seo }]
  }

  const newJsonLd = formatNewJsonLd(jsonLD);
 

  return (
    <Seo
      {...props}
      title={title || props.title}
      description={description || props.description}
      canonical={canonical}
      jsonLDs={newJsonLd}
      noIndexing={noIndexing}
      
    />
  );
}

export default Section;
