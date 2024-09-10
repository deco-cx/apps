import { renderTemplateString } from "./components/Seo.tsx";
import { default as SEOPreview } from "./components/_seo/Preview.tsx";
import { Props as WebsiteAppProps } from "./mod.ts";

interface Props {
  state: WebsiteAppProps;
}

export default function Preview(props: Props) {
  const { seo } = props.state;
  const {
    title: _title = "",
    description: _description = "",
    descriptionTemplate = "%s",
    titleTemplate = "%s",
  } = seo ?? {};
  const title = renderTemplateString(titleTemplate, _title);
  const description = renderTemplateString(
    descriptionTemplate,
    _description,
  );

  return (
    <section>
      {seo && <SEOPreview {...seo} title={title} description={description} />}
      {!seo && <p>SEO not configured</p>}
    </section>
  );
}
