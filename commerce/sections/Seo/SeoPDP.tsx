import Seo, {
  Props as SeoProps,
  SEOSection,
} from "../../../website/components/Seo.tsx";
import { ProductDetailsPage } from "../../types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/canonical.ts";
import { default as BaseSEOPreview } from "../../../website/components/_seo/Preview.tsx";

const getSEOProps = (props: Props) => {
  const { jsonLD, omitVariants, ...otherProps } = props;
  const title = jsonLD?.seo?.title || props.title;
  const description = jsonLD?.seo?.description || props.description;
  const image = jsonLD?.product.image?.[0]?.url || props.image;
  const canonical = props.canonical ||
    (jsonLD?.seo?.canonical
      ? jsonLD.seo.canonical
      : jsonLD?.breadcrumbList
      ? canonicalFromBreadcrumblist(jsonLD?.breadcrumbList)
      : undefined);
  const noIndexing = !jsonLD || jsonLD.seo?.noIndexing;

  if (omitVariants && jsonLD?.product.isVariantOf?.hasVariant) {
    jsonLD.product.isVariantOf.hasVariant = [];
  }

  return {
    ...otherProps,
    title,
    description,
    image,
    canonical,
    noIndexing,
    jsonLDs: [jsonLD],
  };
};

export type Props = {
  jsonLD: ProductDetailsPage | null;
  omitVariants?: boolean;
} & Partial<Omit<SeoProps, "jsonLDs">>;

function Section(props: Props): SEOSection {
  return <Seo {...getSEOProps(props)} />;
}

export function Preview(props: Props) {
  return <BaseSEOPreview {...getSEOProps(props)} />;
}

export default Section;
