import Seo from "../../../website/components/Seo.tsx";
import {
  renderTemplateString,
  SEOSection,
} from "../../../website/components/Seo.tsx";
import { ProductDetailsPage } from "../../types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/canonical.ts";
import { ImageWidget } from "../../../admin/widgets.ts";
import { AppContext } from "../../mod.ts";

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
export function loader(props: Props, _req: Request, ctx: AppContext) {
  const {
    titleTemplate = "",
    descriptionTemplate = "",
  } = ctx.seo ?? {};
  const {
    title: titleProp,
    description: descriptionProp,
    jsonLD,
    omitVariants,
  } = props;

  const title = renderTemplateString(
    titleTemplate,
    titleProp || jsonLD?.seo?.title || "",
  );
  const description = renderTemplateString(
    descriptionTemplate,
    descriptionProp || jsonLD?.seo?.description || "",
  );
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
    ...ctx.seo,
    ...props,
    title,
    description,
    image,
    canonical,
    noIndexing,
    jsonLDs: [jsonLD],
  };
}

function Section(props: Props): SEOSection {
  return <Seo {...props} />;
}

export { default as Preview } from "../../../website/components/_seo/Preview.tsx";

export default Section;
