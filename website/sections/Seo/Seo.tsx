import Seo, { Props as SeoProps } from "../../components/Seo.tsx";

type Props = Omit<SeoProps, "jsonLDs">;

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
