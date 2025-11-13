import { BlogPost } from "../types.ts";
import { CSS } from "../static/css.ts";
import { processMarkdown } from "../utils/markdown.ts";

export interface Props {
  post: BlogPost | null;
}

export default async function Template({ post }: Props) {
  if (!post) return null;

  const {
    title = "Title",
    content = "Content",
    excerpt = "Excerpt",
    date,
    image,
    alt,
  } = post;

  // Process markdown with iframe support
  const processedContent = await processMarkdown(content);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div class="deco-post-preview">
        <h1>{title}</h1>
        <p class="text-xl">{excerpt}</p>
        <p>
          {date
            ? new Date(date).toLocaleDateString("en-US", {
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
        <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      </div>
    </>
  );
}
