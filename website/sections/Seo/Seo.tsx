import Seo, { Props as SeoProps } from "../../components/Seo.tsx";
import { renderTemplateString, SEOSection } from "../../components/Seo.tsx";
import { default as SEOPreview } from "../../../website/components/_seo/Preview.tsx";

type Props = Omit<SeoProps, "jsonLDs">;

function Section(props: Props): SEOSection {
  return <Seo {...props} />;
}

export function Preview(props: Props) {
  const {
    titleTemplate = "",
    title: _title = "",
    descriptionTemplate = "",
    description: _description = "",
  } = props;
  const title = renderTemplateString(titleTemplate, _title);
  const description = renderTemplateString(descriptionTemplate, _description);
  return <SEOPreview {...props} title={title} description={description} />;
}

export default Section;
