import { BlogPost } from "../types.ts";
import { CSS } from "../static/css.ts";
import { renderSection } from "../../website/pages/Page.tsx";
import { AppContext } from "../mod.ts";

export interface Props {
  post: BlogPost | null;
}

export default function Template(
  { post, pageSlug }: ReturnType<typeof loader>,
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
  } = post;

  if (pageSlug) {
    const { slug, categories } = post;
    const categorySlug = categories?.[0]?.slug ?? "";
    const resolvedUrl = pageSlug
      .replace(":category", categorySlug)
      .replace(":slug", slug);

    return (
      <iframe
        src={resolvedUrl}
        style="width:100%;height:100%;border:none;height:100vh;"
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

export const loader = (props: Props, _req: Request, ctx: AppContext) => {
  return {
    ...props,
    pageSlug: ctx.pageSlug,
  };
};
