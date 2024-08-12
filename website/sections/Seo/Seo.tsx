import Seo, { Props as SeoProps } from "../../components/Seo.tsx";
import { AppContext } from "../../mod.ts";

export function loader(props: SeoProps, _req: Request, ctx: AppContext): SeoProps {
  const referer = _req.headers.get("referer");
  return { ...props,canonical: referer! };
}

/**
 * @deprecated true
 * @migrate website/sections/Seo/SeoV2.tsx
 * @title SEO deprecated
 */
function Section(props: SeoProps) {
  return <Seo {...props} />;
}

export { default as Preview } from "../../components/_seo/Preview.tsx";

export default Section;
