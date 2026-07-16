import Seo from "../../../website/components/Seo.tsx";
import {
  renderTemplateString,
  SEOSection,
} from "../../../website/components/Seo.tsx";
import { BlogPostListingPage } from "../../types.ts";
import { AppContext } from "../../mod.ts";
import {
  toBlogPosting,
  toBreadcrumbList,
  toOrganization,
  withCanonicalBase,
} from "../../utils/jsonLD.ts";

export interface Props {
  /** @title Data Source */
  jsonLD: BlogPostListingPage | null;
  /** @title Title Override */
  title?: string;
  /** @title Description Override */
  description?: string;
}

/** @title Blog Post listing */
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

  const canonical = jsonLD?.seo?.canonical ? jsonLD?.seo?.canonical : undefined;
  const noIndexing = !jsonLD || jsonLD.seo?.noIndexing;

  const { canonicalBaseUrl, publisher } = ctx;
  const url = withCanonicalBase(canonical ?? req.url, canonicalBaseUrl);
  const jsonLDs = jsonLD
    ? [
      {
        "@type": "Blog" as const,
        ...(title ? { name: title } : {}),
        ...(description ? { description } : {}),
        url,
        mainEntityOfPage: { "@type": "WebPage" as const, "@id": url },
        ...(publisher?.name ? { publisher: toOrganization(publisher) } : {}),
        blogPost: jsonLD.posts?.map((post) => toBlogPosting(post)) ?? [],
      },
      toBreadcrumbList(url, {
        currentName: jsonLD.category?.name || title || undefined,
        categories: jsonLD.categories ?? undefined,
      }),
    ]
    : [];

  return {
    ...seoSiteProps,
    title,
    description,
    canonical,
    noIndexing,
    jsonLDs,
  };
}

function Section(props: Props): SEOSection {
  return <Seo {...props} />;
}

export default Section;
