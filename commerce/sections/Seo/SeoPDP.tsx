import Seo, { Props as SeoProps } from "../../../website/components/Seo.tsx";
import { ProductDetailsPage } from "../../types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/canonical.ts";

export type Props = {
  jsonLD: ProductDetailsPage | null;
} & Partial<Omit<SeoProps, "jsonLDs">>;

function Section({ jsonLD, ...props }: Props) {
  const title = jsonLD?.seo?.title;
  const description = jsonLD?.seo?.description;
  const image = jsonLD?.product.image?.[0]?.url;
  const canonical = jsonLD?.seo?.canonical
    ? jsonLD.seo.canonical
    : jsonLD?.breadcrumbList
    ? canonicalFromBreadcrumblist(jsonLD?.breadcrumbList)
    : undefined;
  const noIndexing = !jsonLD;

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
