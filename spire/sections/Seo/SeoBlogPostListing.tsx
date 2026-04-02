import Seo from "../../../website/components/Seo.tsx";
import {
  renderTemplateString,
  SEOSection,
} from "../../../website/components/Seo.tsx";
import { BlogPostListingPage } from "../../types.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  /** @title Data Source */
  jsonLD: BlogPostListingPage | null;
  /** @title Title Override */
  title?: string;
  /** @title Description Override */
  description?: string;
}

/** @title Blog Post Listing details */
export function loader(props: Props, _req: Request, ctx: AppContext) {
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

  const jsonLDWithoutContent = {
    ...jsonLD,
    posts: jsonLD?.posts?.map((p) => ({
      ...p,
      content: undefined,
      blocks: undefined,
    })),
  };

  return {
    ...seoSiteProps,
    title,
    description,
    canonical,
    noIndexing,
    jsonLDs: [jsonLDWithoutContent],
  };
}

function Section(props: Props): SEOSection {
  return <Seo {...props} />;
}

export default Section;
