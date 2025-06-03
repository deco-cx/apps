import { Head } from "$fresh/runtime.ts";
import { JSX } from "preact";
import type { ImageWidget } from "../../admin/widgets.ts";
import { safeJsonSerialize, stripHTML } from "../utils/html.ts";

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

  // deno-lint-ignore no-explicit-any
  jsonLDs?: any[];
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
 
  const [{ pageInfo = {}, seo = {} } = {}] = jsonLDs || [{}];

  const currentPage = pageInfo?.currentPage ?? false;
  const isDepartament = jsonLDs[0] ? (pageInfo?.pageTypes && pageInfo?.pageTypes[0] === "Department") || (pageInfo?.pageTypes && pageInfo?.pageTypes[0] === "Search") : null;
  const isPageMoreThanOne = currentPage && currentPage > 1;

  const twitterCard = type === "website" ? "summary" : "summary_large_image";
  const description = stripHTML(desc || "");
  const title = stripHTML(t);
  const url = canonical;

  const PAGE_REGEX = /\?page=([1-9]|[1-4][0-9]|50)/;
  const matchUrl = seo && isDepartament? seo.canonical.match(PAGE_REGEX) : "";
  const processedSeoCanonicalUrl = matchUrl ? seo.canonical.replace(PAGE_REGEX, "/page" + matchUrl[1]) : seo.canonical;

  return (
    <Head>
      <title>
        {renderTemplateString(titleTemplate, title)}
        {isDepartament && isPageMoreThanOne ? ` - Página ${currentPage}` : ""}
      </title>
      <meta
        name="description"
        content={renderTemplateString(descriptionTemplate, description)}
      />
      <meta name="theme-color" content={themeColor} />
      <link rel="icon" href={favicon} />

      {/* Twitter tags */}
      {title && <meta property="twitter:title" content={title} />}
      {description && (
        <meta property="twitter:description" content={description} />
      )}
      {image && <meta property="twitter:image" content={image} />}
      {twitterCard && <meta property="twitter:card" content={twitterCard} />}

      {/* OpenGraph tags */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {type && <meta property="og:type" content={type} />}
      {image && <meta property="og:image" content={image} />}

      {/* Link tags */}
      {canonical && (
        <link rel="canonical" href={isDepartament ? processedSeoCanonicalUrl : url} />
      )}

      {/* No index, no follow */}
      {noIndexing && <meta name="robots" content="noindex, nofollow" />}
      {!noIndexing && <meta name="robots" content="index, follow" />}

      {jsonLDs[0] && jsonLDs.map((json) => (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonSerialize({
              "@context": "https://schema.org",
              ...json,
            }, { returnAsString: true }),
          }}
        />
      ))}
    </Head>
  );
}

export default Component;