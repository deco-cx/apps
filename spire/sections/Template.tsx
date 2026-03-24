import { BlogPost } from "../types.ts";
import { CSS } from "../../blog/static/css.ts";
import { renderSection } from "../../website/pages/Page.tsx";

export interface Props {
  post: BlogPost | null;
}

export default function Template({ post }: Props) {
  if (!post) return null;

  const { title, excerpt, date, image, alt, sections } = post;

  return (
    <>
      <link href="/styles.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div class="deco-post-preview">
        <h1>{title}</h1>
        <p class="text-xl">{excerpt}</p>
        <p>
          {date
            ? new Date(date).toLocaleDateString("pt-BR", {
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
        <div class="content-sections">
          {sections?.map(renderSection)}
        </div>
      </div>
    </>
  );
}
