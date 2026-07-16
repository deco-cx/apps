import { Author, BlogPost } from "../types.ts";

const toPerson = (author: Author) => ({
  "@type": "Person" as const,
  name: author.name,
  ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
  ...(author.company
    ? { worksFor: { "@type": "Organization" as const, name: author.company } }
    : {}),
});

/**
 * Maps a BlogPost to a schema.org BlogPosting node, following
 * https://developers.google.com/search/docs/appearance/structured-data/article
 *
 * The "@context" is intentionally omitted: the Seo component adds it when
 * serializing the top-level JSON-LD object.
 */
export const toBlogPosting = (post: BlogPost, url?: string) => {
  const image = post.seo?.image || post.image;
  const categories = post.categories
    ?.map((category) => category.name)
    .filter(Boolean);

  return {
    "@type": "BlogPosting" as const,
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(image ? { image: [image] } : {}),
    ...(post.date ? { datePublished: post.date } : {}),
    ...(post.authors?.length ? { author: post.authors.map(toPerson) } : {}),
    ...(categories?.length ? { articleSection: categories } : {}),
    ...(post.readTime ? { timeRequired: `PT${post.readTime}M` } : {}),
    ...(url
      ? { url, mainEntityOfPage: { "@type": "WebPage" as const, "@id": url } }
      : {}),
    ...(post.aggregateRating ? { aggregateRating: post.aggregateRating } : {}),
    ...(post.interactionStatistic
      ? { interactionStatistic: post.interactionStatistic }
      : {}),
  };
};
