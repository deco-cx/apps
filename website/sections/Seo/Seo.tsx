import Seo, { Props as SeoProps } from "../../components/Seo.tsx";

export function loader(props: SeoProps, req: Request): SeoProps {
  const referer = req.headers.get("referer");
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
