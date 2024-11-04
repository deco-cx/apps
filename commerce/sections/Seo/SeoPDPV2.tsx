import Seo from "../../../website/components/Seo.tsx";
import {
  renderTemplateString,
  SEOSection,
} from "../../../website/components/Seo.tsx";
import { ProductDetailsPage } from "../../types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/canonical.ts";
import { AppContext } from "../../mod.ts";

interface SeoProps {
  /** @title Title Override */
  title?: string;
  /** @title Description Override */
  description?: string;
  /**
   * @title Disable indexing
   * @description In testing, you can use this to prevent search engines from indexing your site
   */
  noIndexing?: boolean;
}

export interface Props {
  /** @title Data Source */
  jsonLD: ProductDetailsPage | null;
  omitVariants?: boolean;
  seo?: SeoProps;
}

/** @title Product details */
export function loader(_props: Props, _req: Request, ctx: AppContext) {
  const props = _props as Partial<Props>;

  const {
    titleTemplate = "",
    descriptionTemplate = "",
    ...seoSiteProps
  } = ctx.seo ?? {};
  const {
    seo,
    jsonLD,
    omitVariants,
  } = props;

  console.log(props);

  const title = renderTemplateString(
    titleTemplate,
    seo?.title || jsonLD?.seo?.title || ctx.seo?.title || "",
  );
  const description = renderTemplateString(
    descriptionTemplate,
    seo?.description || jsonLD?.seo?.description || ctx.seo?.description ||
      "",
  );

  const image = jsonLD?.product.image?.[0]?.url;
  const canonical = jsonLD?.seo?.canonical
    ? jsonLD?.seo?.canonical
    : jsonLD?.breadcrumbList
    ? canonicalFromBreadcrumblist(jsonLD?.breadcrumbList)
    : undefined;
  const noIndexing = seo?.noIndexing || !jsonLD || jsonLD.seo?.noIndexing;

  if (omitVariants && jsonLD?.product.isVariantOf?.hasVariant) {
    jsonLD.product.isVariantOf.hasVariant = [];
  }

  return {
    ...seoSiteProps,
    title,
    description,
    image,
    canonical,
    noIndexing,
    jsonLDs: [jsonLD],
  };
}

function Section(props: Props): SEOSection {
  const { seo, jsonLD } = props;

  const seoProps = {
    title: seo?.title || "",
    description: seo?.description || "",
    noIndexing: seo?.noIndexing || false,
    jsonLDs: jsonLD ? [jsonLD] : [],
    image: jsonLD?.product.image?.[0]?.url || "",
    canonical: jsonLD?.seo?.canonical || "",
  };
  return <Seo {...seoProps} />;
}

export function LoadingFallback(props: Partial<Props>) {
  const { seo, jsonLD } = props;

  const seoProps = {
    title: seo?.title || "",
    description: seo?.description || "",
    noIndexing: seo?.noIndexing || false,
    jsonLDs: jsonLD ? [jsonLD] : [],
    image: jsonLD?.product.image?.[0]?.url || "",
    canonical: jsonLD?.seo?.canonical || "",
  };

  return <Seo {...seoProps} />;
}

export { default as Preview } from "../../../website/components/_seo/Preview.tsx";

export default Section;
