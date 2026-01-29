import { Head } from "fresh/runtime";
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

  /** @title Open Graph Config */
  openGraphConfig?: {
    title?: string;
    description?: string;
    image?: ImageWidget;
    url?: string;
  };

  /** @title Twitter Config */
  twitterConfig?: {
    title?: string;
    description?: string;
    image?: ImageWidget;
  };

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
  openGraphConfig,
  twitterConfig,
  jsonLDs = [],
}: Props) {
  const twitterCard = type === "website" ? "summary" : "summary_large_image";

  const title = stripHTML(t);
  const description = stripHTML(desc || "");

  const twitterImage = twitterConfig?.image ?? image;
  const twitterTitle = twitterConfig?.title
    ? stripHTML(twitterConfig.title)
    : title;
  const twitterDescription = twitterConfig?.description
    ? stripHTML(twitterConfig.description)
    : description;

  const openGraphImage = openGraphConfig?.image ?? image;
  const openGraphTitle = openGraphConfig?.title
    ? stripHTML(openGraphConfig.title)
    : title;
  const openGraphDescription = openGraphConfig?.description
    ? stripHTML(openGraphConfig.description)
    : description;

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
      <meta property="twitter:title" content={twitterTitle} />
      <meta
        property="twitter:description"
        content={twitterDescription}
      />
      <meta property="twitter:image" content={twitterImage} />
      <meta property="twitter:card" content={twitterCard} />

      {/* OpenGraph tags */}
      <meta property="og:title" content={openGraphTitle} />
      <meta
        property="og:description"
        content={openGraphDescription}
      />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={openGraphImage} />
      {Boolean(openGraphConfig?.url || canonical) && (
        <meta property="og:url" content={openGraphConfig?.url ?? canonical} />
      )}

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
