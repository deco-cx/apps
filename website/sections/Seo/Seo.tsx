import Seo, { Props as SeoProps, SEOSection } from "../../components/Seo.tsx";

type Props = Omit<SeoProps, "jsonLDs">;

function Section(props: Props): SEOSection {
  return <Seo {...props} />;
}

export { default as Preview } from "../../components/_seo/Preview.tsx";

export default Section;
