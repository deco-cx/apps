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
  const canonical = jsonLD?.breadcrumbList
    ? canonicalFromBreadcrumblist(jsonLD?.breadcrumbList)
    : null;

  return (
    <Seo
      {...props}
      title={title || props.title}
      description={description || props.description}
      image={image || props.image}
      canonical={canonical || props.canonical}
      jsonLDs={[jsonLD]}
    />
  );
}

export default Section;
