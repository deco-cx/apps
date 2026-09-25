import { BlogPost, Category } from "../types.ts";
import { CSS } from "../static/css.ts";
import { renderSection } from "../../website/pages/Page.tsx";
import { AppContext } from "../mod.ts";
import { getRecordsByPath } from "../core/records.ts";
import {
  ancestorsOf,
  categoryPathname,
  indexCategories,
} from "../core/categoryTree.ts";

const CATEGORIES_PATH = "collections/blog/categories";
const CATEGORY_ACCESSOR = "category";

export interface Props {
  post: BlogPost | null;
}

const iframeStyle = "width:100%;height:100%;border:none;height:100vh;";

export default function Template(
  { post, pageSlug, categorySlug, postCategorySlug }: Awaited<
    ReturnType<typeof loader>
  >,
) {
  if (!post) return null;

  const {
    title = "Title",
    content = "Content",
    excerpt = "Excerpt",
    date,
    image,
    alt,
    sections,
    slug,
  } = post;

  if (pageSlug) {
    const resolvedUrl = pageSlug
      .replace(/:category\*?/, postCategorySlug)
      .replace(":slug", slug);

    return (
      <iframe
        src={resolvedUrl}
        style={iframeStyle}
      />
    );
  }

  if (categorySlug) {
    const resolvedUrl = categorySlug.replace(/:category\*?/, postCategorySlug);

    return (
      <iframe
        src={resolvedUrl}
        style={iframeStyle}
      />
    );
  }

  return (
    <>
      <link href="/styles.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div class="deco-post-preview">
        <h1>{title}</h1>
        <p class="text-xl">{excerpt}</p>
        <p>
          {date
            ? new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
            : ""}
        </p>
        {image && (
          <img
            class="w-full rounded-2xl bg-cover"
            src={image}
            alt={alt ?? title}
          />
        )}
        <div dangerouslySetInnerHTML={{ __html: content as string }} />
        <div class="content-sections">
          {sections?.map(renderSection)}
        </div>
      </div>
    </>
  );
}

export const loader = async (props: Props, _req: Request, ctx: AppContext) => {
  // The preview iframe has to hit the real URL, and a subcategory's URL carries
  // its whole ancestor path.
  const primarySlug = props.post?.categories?.[0]?.slug;
  let postCategorySlug = typeof primarySlug === "string" ? primarySlug : "";

  if (postCategorySlug) {
    const categories = await getRecordsByPath<Category>(
      ctx,
      CATEGORIES_PATH,
      CATEGORY_ACCESSOR,
    );
    const chain = ancestorsOf(postCategorySlug, indexCategories(categories));
    if (chain?.length) {
      postCategorySlug = categoryPathname(chain);
    }
  }

  return {
    ...props,
    pageSlug: ctx.pageSlug,
    categorySlug: ctx.categorySlug,
    postCategorySlug,
  };
};
