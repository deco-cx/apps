import Seo from "../../../website/components/Seo.tsx";
import {
  renderTemplateString,
  SEOSection,
} from "../../../website/components/Seo.tsx";
import { BlogPostPage } from "../../types.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  /** @title Data Source */
  jsonLD: BlogPostPage | null;
  /** @title Title Override */
  title?: string;
  /** @title Description Override */
  description?: string;
}

/** @title Blog Post details */
export function loader(props: Props, _req: Request, ctx: AppContext) {
  const {
    titleTemplate = "",
    descriptionTemplate = "",
    ...seoSiteProps
  } = ctx.seo ?? {};
  const { title: titleProp, description: descriptionProp, jsonLD } = props;

  const title = renderTemplateString(
    titleTemplate,
    titleProp || jsonLD?.seo?.title || "",
  );
  const description = renderTemplateString(
    descriptionTemplate,
    descriptionProp || jsonLD?.seo?.description || "",
  );
  const image = jsonLD?.post.image;
  const canonical = jsonLD?.seo?.canonical ? jsonLD?.seo?.canonical : undefined;
  const noIndexing = !jsonLD || jsonLD.seo?.noIndexing;

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
  return <Seo {...props} />;
}

export default Section;
