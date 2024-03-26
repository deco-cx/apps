import Seo, { Props as SeoProps } from "../../../website/components/Seo.tsx";
import { ProductListingPage } from "../../types.ts";
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

  const noIndexing = jsonLD?.seo?.noIndexing || !jsonLD ||
    !jsonLD.products.length;

  return (
    <Seo
      {...props}
      title={title || props.title}
      description={description || props.description}
      canonical={canonical}
      jsonLDs={[jsonLD]}
      noIndexing={noIndexing}
    />
  );
}

export default Section;
