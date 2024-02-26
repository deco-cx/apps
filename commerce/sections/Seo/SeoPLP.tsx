import Seo, {
  Props as SeoProps,
  SEOSection,
} from "../../../website/components/Seo.tsx";
import { ProductListingPage } from "../../types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/canonical.ts";
import { default as BaseSEOPreview } from "../../../website/components/_seo/Preview.tsx";

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
    noIndexing,
    jsonLDs: [jsonLD],
  };
};

export type Props = {
  jsonLD: ProductListingPage | null;
} & Partial<Omit<SeoProps, "jsonLDs">>;

function Section(props: Props): SEOSection {
  return <Seo {...getSEOProps(props)} />;
}

export function Preview(props: Props) {
  return <BaseSEOPreview {...getSEOProps(props)} />;
}

export default Section;
