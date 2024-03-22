import Seo, { Props as SeoProps } from "../../../website/components/Seo.tsx";
import { ProductDetailsPage } from "../../types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/canonical.ts";

export type Props = {
  jsonLD: ProductDetailsPage | null;
  omitVariants?: boolean;
} & Partial<Omit<SeoProps, "jsonLDs">>;

/**
 * @deprecated true
 * @migrate commerce/sections/Seo/SeoPDPV2.tsx
 * @title SeoPDP deprecated
 */
function Section({ jsonLD, omitVariants, ...props }: Props) {
  const title = jsonLD?.seo?.title;
  const description = jsonLD?.seo?.description;
  const image = jsonLD?.product.image?.[0]?.url;
  const canonical = jsonLD?.seo?.canonical
    ? jsonLD.seo.canonical
    : jsonLD?.breadcrumbList
    ? canonicalFromBreadcrumblist(jsonLD?.breadcrumbList)
    : undefined;
  const noIndexing = !jsonLD || jsonLD.seo?.noIndexing;

  if (omitVariants && jsonLD?.product.isVariantOf?.hasVariant) {
    jsonLD.product.isVariantOf.hasVariant = [];
  }

  return (
    <Seo
      {...props}
      title={title || props.title}
      description={description || props.description}
      image={image || props.image}
      canonical={props.canonical || canonical}
      jsonLDs={[jsonLD]}
      noIndexing={noIndexing}
    />
  );
}

export default Section;
