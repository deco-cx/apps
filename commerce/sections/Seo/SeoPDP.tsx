import Seo from "../../../website/components/Seo.tsx";
import {
  renderTemplateString,
  SEOSection,
} from "../../../website/components/Seo.tsx";
import { ProductDetailsPage } from "../../types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/canonical.ts";
import { default as SEOPreview } from "../../../website/components/_seo/Preview.tsx";
import { ImageWidget } from "../../../admin/widgets.ts";

const getSEOProps = (props: Props) => {
  const { jsonLD, omitVariants } = props;
  const title = jsonLD?.seo?.title || props.title;
  const description = jsonLD?.seo?.description || props.description;
  const image = jsonLD?.product.image?.[0]?.url || props.image;
  const canonical = props.canonical || jsonLD?.seo?.canonical
    ? jsonLD?.seo?.canonical
    : jsonLD?.breadcrumbList
    ? canonicalFromBreadcrumblist(jsonLD?.breadcrumbList)
    : undefined;
  const noIndexing = !jsonLD || jsonLD.seo?.noIndexing;

  if (omitVariants && jsonLD?.product.isVariantOf?.hasVariant) {
    jsonLD.product.isVariantOf.hasVariant = [];
  }

  return {
    ...props,
    title,
    description,
    image,
    canonical,
    noIndexing,
    jsonLDs: [jsonLD],
  };
};

export interface Props {
  /** @title Data Source */
  jsonLD: ProductDetailsPage | null;
  omitVariants?: boolean;
  title?: string;
  /** @hide true */
  titleTemplate?: string;

  description?: string;
  /** @hide true */
  descriptionTemplate?: string;

  /** @hide true */
  canonical?: string;
  /** @hide true */
  image?: ImageWidget;
}

/** @title Product details */
function Section(props: Props): SEOSection {
  return <Seo {...getSEOProps(props)} />;
}

export function Preview(_props: Props) {
  const props = getSEOProps(_props);
  const {
    descriptionTemplate = "",
    titleTemplate = "",
    title: _title = "",
    description: _description = "",
  } = props;
  const title = renderTemplateString(titleTemplate, _title);
  const description = renderTemplateString(descriptionTemplate, _description);

  return (
    <SEOPreview
      {...getSEOProps(props)}
      title={title}
      description={description}
    />
  );
}

export default Section;
