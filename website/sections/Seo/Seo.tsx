import Seo, { Props as SeoProps } from "../../components/Seo.tsx";

type Props = Omit<SeoProps, "jsonLDs">;

/** @title SEO deprecated */
function Section(props: Props) {
  return <Seo {...props} />;
}

export { default as Preview } from "../../components/_seo/Preview.tsx";

export default Section;
