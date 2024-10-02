import { BlogPost } from "../types.ts";
import { CSS } from "../static/css.ts";

export interface Props {
  post: BlogPost | null;
}

export default function Template({ post }: Props) {
  if (!post) return null;

  const {
    title = "Title",
    content = "Content",
    excerpt = "Excerpt",
    date,
    image,
    alt,
  } = post;

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
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </>
  );
}
