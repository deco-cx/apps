import { Author, BlogPost, Category, Publisher } from "../types.ts";

const toAuthor = (author: Author) => {
  const type = author.type ?? "Person";
  return {
    "@type": type,
    name: author.name,
    // jobTitle and worksFor are Person-only properties
    ...(type === "Person" && author.jobTitle
      ? { jobTitle: author.jobTitle }
      : {}),
    ...(type === "Person" && author.company
      ? { worksFor: { "@type": "Organization" as const, name: author.company } }
      : {}),
  };
};

export const toOrganization = (publisher: Publisher) => ({
  "@type": "Organization" as const,
  name: publisher.name,
  ...(publisher.url ? { url: publisher.url } : {}),
  ...(publisher.logo
    ? { logo: { "@type": "ImageObject" as const, url: publisher.logo } }
    : {}),
});

/**
 * Normalizes a page URL for SEO use (canonical and JSON-LD): strips the query
 * string and hash, keeping only origin + pathname, and replaces the origin
 * with the canonical base's when one is configured. Relative URLs are
 * resolved against the canonical base; without a base, relative URLs are
 * returned unchanged.
 */
export const withCanonicalBase = (url: string, canonicalBaseUrl?: string) => {
  if (!canonicalBaseUrl) {
    if (!URL.canParse(url)) {
      return url;
    }
    const { origin, pathname } = new URL(url);
    return origin + pathname;
  }
  const { pathname } = new URL(url, canonicalBaseUrl);
  return new URL(pathname, canonicalBaseUrl).href;
};

/**
 * Maps a BlogPost to a schema.org BlogPosting node, following
 * https://developers.google.com/search/docs/appearance/structured-data/article
 *
 * The "@context" is intentionally omitted: the Seo component adds it when
 * serializing the top-level JSON-LD object.
 */
export const toBlogPosting = (
  post: BlogPost,
  url?: string,
  publisher?: Publisher,
) => {
  const image = post.seo?.image || post.image;
  const categories = post.categories
    ?.map((category) => category.name)
    .filter(Boolean);

  // AggregateRating requires ratingValue and ratingCount/reviewCount;
  // InteractionCounter requires userInteractionCount. Posts may carry empty
  // {"@type": ...} stubs, which are invalid in the Rich Results Test.
  const aggregateRating = post.aggregateRating?.ratingValue != null &&
      (post.aggregateRating.ratingCount != null ||
        post.aggregateRating.reviewCount != null)
    ? post.aggregateRating
    : undefined;
  const interactionStatistic =
    post.interactionStatistic?.userInteractionCount != null
      ? post.interactionStatistic
      : undefined;

  return {
    "@type": "BlogPosting" as const,
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(image ? { image: [image] } : {}),
    ...(post.date ? { datePublished: post.date } : {}),
    ...(post.dateModified ? { dateModified: post.dateModified } : {}),
    ...(post.authors?.length ? { author: post.authors.map(toAuthor) } : {}),
    ...(publisher?.name ? { publisher: toOrganization(publisher) } : {}),
    ...(categories?.length ? { articleSection: categories } : {}),
    ...(post.readTime && post.readTime > 0 && Number.isFinite(post.readTime)
      ? { timeRequired: `PT${post.readTime}M` }
      : {}),
    ...(url
      ? { url, mainEntityOfPage: { "@type": "WebPage" as const, "@id": url } }
      : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(interactionStatistic ? { interactionStatistic } : {}),
  };
};

const humanize = (slug: string) =>
  decodeURIComponent(slug)
    .replace(/[-_]+/g, " ")
    .replace(/^./, (char) => char.toUpperCase());

/**
 * Builds a schema.org BreadcrumbList from the pathname of the given absolute
 * URL. Intermediate segments resolve their names against the known categories
 * (falling back to a humanized slug) and link to absolute URLs; the last item
 * uses the real page name and omits "item", as allowed by Google.
 */
export const toBreadcrumbList = (
  url: string,
  { currentName, categories }: {
    currentName?: string;
    categories?: Category[];
  } = {},
) => {
  const { origin, pathname } = new URL(url);
  const segments = pathname.split("/").filter(Boolean);

  const nameOf = (segment: string) =>
    categories?.find((category) => category.slug === segment)?.name ??
      humanize(segment);

  const itemListElement = segments.map((segment, index) => {
    const isLast = index === segments.length - 1;
    return {
      "@type": "ListItem" as const,
      position: index + 1,
      name: isLast ? currentName || nameOf(segment) : nameOf(segment),
      ...(isLast
        ? {}
        : { item: `${origin}/${segments.slice(0, index + 1).join("/")}` }),
    };
  });

  return { "@type": "BreadcrumbList" as const, itemListElement };
};
