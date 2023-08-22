import Seo, { Props as SeoProps } from "../../components/Seo.tsx";

type Props = Omit<SeoProps, "jsonLDs">;

function Section(props: Props) {
  return <Seo {...props} />;
}

export { default as Preview } from "../../components/_seo/Preview.tsx";

export default Section;
