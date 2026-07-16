import Seo from "../../../website/components/Seo.tsx";
import {
  renderTemplateString,
  SEOSection,
} from "../../../website/components/Seo.tsx";
import { BlogPostPage } from "../../types.ts";
import { AppContext } from "../../mod.ts";
import {
  toBlogPosting,
  toBreadcrumbList,
  withCanonicalBase,
} from "../../utils/jsonLD.ts";

export interface Props {
  /** @title Data Source */
  jsonLD: BlogPostPage | null;
  /** @title Title Override */
  title?: string;
  /** @title Description Override */
  description?: string;
}

/** @title Blog Post details */
export function loader(props: Props, req: Request, ctx: AppContext) {
  const rawSeo = (ctx as unknown as { seo: Record<string, unknown> }).seo ?? {};
  const titleTemplate = typeof rawSeo.titleTemplate === "string"
    ? rawSeo.titleTemplate
    : "%s";
  const descriptionTemplate = typeof rawSeo.descriptionTemplate === "string"
    ? rawSeo.descriptionTemplate
    : "%s";
  const { titleTemplate: _tt, descriptionTemplate: _dt, ...seoSiteProps } =
    rawSeo;

  const { title: titleProp, description: descriptionProp, jsonLD } = props;

  const title = renderTemplateString(
    titleTemplate,
    titleProp || jsonLD?.seo?.title || "",
  );
  const description = renderTemplateString(
    descriptionTemplate,
    descriptionProp || jsonLD?.seo?.description || "",
  );

  const image = jsonLD?.post?.seo?.image || jsonLD?.seo?.image ||
    jsonLD?.post?.image;
  const canonical = jsonLD?.seo?.canonical ? jsonLD?.seo?.canonical : undefined;
  const noIndexing = !jsonLD || jsonLD.seo?.noIndexing;

  const { canonicalBaseUrl, publisher } = ctx;
  const pageUrl = withCanonicalBase(canonical ?? req.url, canonicalBaseUrl);
  const jsonLDs = jsonLD?.post
    ? [
      toBlogPosting(jsonLD.post, pageUrl, publisher),
      toBreadcrumbList(pageUrl, {
        currentName: jsonLD.post.title,
        categories: jsonLD.post.categories,
      }),
    ]
    : [];

  return {
    ...seoSiteProps,
    title,
    description,
    image,
    canonical,
    noIndexing,
    jsonLDs,
  };
}

function Section(props: Props): SEOSection {
  return <Seo {...props} />;
}

export default Section;
