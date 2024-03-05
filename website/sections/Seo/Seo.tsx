import Seo, { Props as SeoProps } from "../../components/Seo.tsx";
import { renderTemplateString, SEOSection } from "../../components/Seo.tsx";
import { AppContext } from "../../mod.ts";

type Props = Pick<
  SeoProps,
  "title" | "description" | "type" | "favicon" | "image" | "themeColor"
>;

export function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const {
    titleTemplate = "",
    descriptionTemplate = "",
    title: appTitle = "",
    description: appDescription = "",
  } = ctx.seo ?? {};
  const { title: _title, description: _description } = props;
  const title = renderTemplateString(titleTemplate, _title ?? appTitle);
  const description = renderTemplateString(
    descriptionTemplate,
    _description ?? appDescription,
  );

  return { ...ctx.seo, ...props, title, description };
}

function Section(props: Props): SEOSection {
  return <Seo {...props} />;
}

export { default as Preview } from "../../../website/components/_seo/Preview.tsx";

export default Section;
