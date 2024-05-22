import Seo, { Props as SeoProps } from "../../components/Seo.tsx";
import { AppContext } from "../../mod.ts";

type Props = Omit<SeoProps, "jsonLDs">;

export function loader(props: Props, _req: Request, ctx: AppContext): Props {
  const referer = _req.headers.get("referer");
  return { canonical: referer! };
}

/**
 * @deprecated true
 * @migrate website/sections/Seo/SeoV2.tsx
 * @title SEO deprecated
 */
function Section(props: Props) {
  return <Seo {...props} />;
}

export { default as Preview } from "../../components/_seo/Preview.tsx";

export default Section;
