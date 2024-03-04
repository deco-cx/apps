import { default as SEOPreview } from "./components/_seo/Preview.tsx";
import { Props as WebsiteAppProps } from "./mod.ts";

interface Props {
  state: WebsiteAppProps;
}

export default function Preview(props: Props) {
  const { seo } = props.state;

  return (
    <section>
      {seo && <SEOPreview {...seo} />}
      {!seo && <p>SEO not configured</p>}
    </section>
  );
}
