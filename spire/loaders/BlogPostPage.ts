import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostPage, SpirePost } from "../types.ts";
import { blocksToSections } from "../utils/blocksToSections.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { Resolved } from "@deco/deco";
import { Section } from "@deco/deco/blocks";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title BlogPostPage
 * @description Fetches a specific Spire blog post page by its slug.
 */
export const cache = {
  maxAge: 60 * 60 * 24, // 24 hours
};

export const cacheKey = (props: Props, _req: Request, ctx: AppContext) => {
  return `spire-post-${ctx.account}-${props.slug}`;
};

export default async function BlogPostPageLoader(
  { slug }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPostPage | null> {
  const { account, api } = ctx;
  const url = new URL(req.url);

  const response = await api["GET /blog/:account/posts/:slug"](
    { account, slug },
  );

  if (!response.ok) {
    logger.error(
      `BlogPostPage: fetch failed for slug "${slug}" — ${response.status} ${response.statusText}`,
    );
    return null;
  }

  const { post } = await response.json();

  if (!post) {
    logger.error(`BlogPostPage: no post found for slug "${slug}"`);
    return null;
  }

  const blogPost = spirePostToBlogPost(post, ctx.overrideMap);

  return {
    "@type": "BlogPostPage",
    post: blogPost,
    seo: {
      title: post.version.metaTitle || post.version.title,
      description: post.version.metaDescription || post.version.description,
      image: post.version.imageUrl,
      canonical: url.href,
      noIndexing: false,
    },
  };
}

export function spirePostToBlogPost(
  post: SpirePost,
  overrides: Record<string, Resolved<Section>> = {},
): BlogPost {
  return {
    id: post.id,
    title: post.version.title,
    excerpt: post.version.description,
    image: post.version.imageUrl,
    alt: post.version.title,
    authors: post.authors.map((a) => ({
      name: a.name,
      email: "",
      avatar: a.avatarUrl ?? undefined,
    })),
    categories: [],
    date: post.publishedAt ?? "",
    slug: post.slug,
    seo: {
      title: post.version.metaTitle,
      description: post.version.metaDescription,
      image: post.version.imageUrl,
    },
    sections: blocksToSections(post.version.blocks, overrides),
  };
}
