import Seo from "../../../website/components/Seo.tsx";
import {
  renderTemplateString,
  SEOSection,
} from "../../../website/components/Seo.tsx";
import { ProductListingPage } from "../../types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/canonical.ts";
import { default as SEOPreview } from "../../../website/components/_seo/Preview.tsx";

const getSEOProps = (props: Props) => {
  const { jsonLD } = props;
  const title = jsonLD?.seo?.title || props.title;
  const description = jsonLD?.seo?.description || props.description;
  const canonical = props.canonical
    ? props.canonical
    : jsonLD?.seo?.canonical
    ? jsonLD.seo.canonical
    : jsonLD?.breadcrumb
    ? canonicalFromBreadcrumblist(jsonLD?.breadcrumb)
    : undefined;

  const noIndexing = !jsonLD || !jsonLD.products.length;
  return {
    ...props,
    title,
    description,
    canonical,
    jsonLDs: [jsonLD],
    noIndexing,
  };
};

export interface Props {
  /** @title Data Source */
  jsonLD: ProductListingPage | null;
  title?: string;
  /** @hide true */
  titleTemplate?: string;

  description?: string;
  /** @hide true */
  descriptionTemplate?: string;
  /** @hide true */
  canonical?: string;
}

/** @title Product listing */
function Section(props: Props): SEOSection {
  return <Seo {...getSEOProps(props)} />;
}

export function Preview(_props: Props) {
  const props = getSEOProps(_props);
  const {
    titleTemplate = "",
    title: _title = "",
    descriptionTemplate = "",
    description: _description = "",
  } = props;
  const title = renderTemplateString(titleTemplate, _title);
  const description = renderTemplateString(descriptionTemplate, _description);

  return <SEOPreview {...props} title={title} description={description} />;
}

export default Section;
