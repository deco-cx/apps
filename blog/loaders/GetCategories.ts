/**
 * Retrieves a listing page of blog posts.
 *
 * @param props - The props for the blog post listing.
 * @param req - The request object.
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { Category } from "../types.ts";
import { getRecordsByPath } from "../utils/records.ts";

const COLLECTION_PATH = "collections/blog/categories";
const ACCESSOR = "category";

export interface Props {
  /**
   * @title Category Slug
   * @description Get the category data from a specific slug.
   */
  slug?: RequestURLParam;
  /**
   * @title Items count
   * @description Number of categories to return
   */
  count?: number;
  /**
   * @title Sort
   * @description The sorting option. Default is "title_desc"
   */
  sortBy?: "title_asc" | "title_desc";
}

/**
 * @title BlogPostList
 * @description Retrieves a list of blog posts.
 *
 * @param props - The props for the blog post list.
 * @param req - The request object.
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
export default async function GetCategories(
  { count, slug, sortBy = "title_desc" }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Category[] | null> {
  const categories = await getRecordsByPath<Category>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  if (!categories?.length) {
    return null;
  }

  if (slug) {
    return categories.filter((c) => c.slug === slug);
  }

  const sortedCategories = categories.sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return sortBy.endsWith("_desc") ? comparison : -comparison;
  });

  return count ? sortedCategories.slice(0, count) : sortedCategories;
}
