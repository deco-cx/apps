import { Head } from "$fresh/runtime.ts";
import type { ImageWidget } from "../../admin/widgets.ts";
import { stripHTML } from "../utils/html.ts";
import { JSX } from "preact";

export const renderTemplateString = (template: string, value: string) =>
  template.replace("%s", value);

export type SEOSection = JSX.Element;
export type OGType = "website" | "article";

export interface Props {
  title?: string;
  /**
   * @title Title template
   * @description add a %s whenever you want it to be replaced with the product name, category name or search term
   * @default %s
   */
  titleTemplate?: string;
  description?: string;
  /**
   * @title Description template
   * @description add a %s whenever you want it to be replaced with the product name, category name or search term
   * @default %s
   */
  descriptionTemplate?: string;
  /** @default website */
  type?: OGType;
  /** @description Recommended: 1200 x 630 px (up to 5MB) */
  image?: ImageWidget;
  /** @description Recommended: 16 x 16 px */
  favicon?: ImageWidget;
  /** @description Suggested color that browsers should use to customize the display of the page or of the surrounding user interface */
  themeColor?: string;
  /** @title Canonical URL */
  canonical?: string;
  /**
   * @title Disable indexing
   * @description In testing, you can use this to prevent search engines from indexing your site
   */
  noIndexing?: boolean;

  jsonLDs?: unknown[];
}

function Component({
  title: t = "",
  titleTemplate = "%s",
  description: desc,
  descriptionTemplate = "%s",
  type,
  image,
  favicon,
  themeColor,
  canonical,
  noIndexing,
  jsonLDs = [],
}: Props) {
  const twitterCard = type === "website" ? "summary" : "summary_large_image";
  const description = stripHTML(desc || "");
  const title = stripHTML(t);

  return (
    <Head>
      <title>{renderTemplateString(titleTemplate, title)}</title>
      <meta
        name="description"
        content={renderTemplateString(descriptionTemplate, description)}
      />
      <meta name="theme-color" content={themeColor} />
      <link rel="icon" href={favicon} />

      {/* Twitter tags */}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:card" content={twitterCard} />

      {/* OpenGraph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />

      {/* Link tags */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* No index, no follow */}
      {noIndexing && <meta name="robots" content="noindex, nofollow" />}
      {!noIndexing && <meta name="robots" content="index, follow" />}

      {jsonLDs.map((json) => (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              // @ts-expect-error Trust me, I'm an engineer
              ...json,
            }),
          }}
        />
      ))}
    </Head>
  );
}

export default Component;
