import { AppContext } from "../mod.ts";
import { logger } from "@deco/deco/o11y";
import { BlogPost, BlogPostPage, Category, isLivePost } from "../types.ts";
import { getRecordsByPath } from "../core/records.ts";
import {
  ancestorsOf,
  indexCategories,
  withCategoryPath,
} from "../core/categoryTree.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";
const CATEGORIES_PATH = "collections/blog/categories";
const CATEGORY_ACCESSOR = "category";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title BlogPostPage
 * @description Fetches a specific blog post page by its slug.
 *
 * @param props - Contains the slug of the blog post.
 * @param _req - The request object (unused).
 * @param ctx - The application context.
 * @returns A promise that resolves to the blog post or undefined if not found.
 */
export default async function BlogPostPageLoader(
  { slug }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPostPage | null> {
  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  const { url: baseUrl } = req;
  const url = new URL(baseUrl);

  const post = posts.find((post) => post?.slug === slug);

  if (!post) {
    return null;
  }

  // The post lives under the full path of its primary category, so the
  // breadcrumb and the canonical need that category's ancestor chain. A broken
  // categories collection must not take the post page down with it.
  let categories: Category[] = [];
  try {
    categories = await getRecordsByPath<Category>(
      ctx,
      CATEGORIES_PATH,
      CATEGORY_ACCESSOR,
    ) ?? [];
  } catch (e) {
    logger.error(e);
  }

  const primarySlug = post.categories?.[0]?.slug;
  const chain = typeof primarySlug === "string" && primarySlug
    ? ancestorsOf(primarySlug, indexCategories(categories))
    : null;

  const categoryPath = chain ??
    (post.categories?.[0] ? [post.categories[0]] : null);

  return {
    "@type": "BlogPostPage",
    post,
    categories: categoryPath,
    seo: {
      title: post?.seo?.title || post?.title,
      description: post?.seo?.description || post?.excerpt,
      canonical: post?.seo?.canonical ||
        (categoryPath?.length
          ? withCategoryPath(url, categoryPath, {
            knownSlugs: new Set(categories.map((c) => c?.slug)),
            trailing: post.slug,
          })
          : url.href),
      image: post?.seo?.image || post?.image,
      // A post that isn't live yet — unpublished, or scheduled for an instant
      // still ahead — renders anyway, because that page *is* the CMS preview.
      // It just must never be indexed, even if the URL leaks. A scheduled post
      // becomes indexable on its own once its instant passes.
      noIndexing: post?.seo?.noIndexing || !isLivePost(post),
    },
  };
}
