import { BlogPost } from "../types.ts";
import { CSS } from "../static/css.ts";
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
        <h1 class="text-4xl font-bold mb-4">{title}</h1>
        <p class="text-xl mb-4 italic">{excerpt}</p>
        
        {image && (
          <img
            class="w-full rounded-2xl mb-8"
            src={image}
            alt={alt ?? title}
          />
        )}
        
        <div 
          class="prose max-w-none mb-10" 
          dangerouslySetInnerHTML={{ __html: content as string }} 
        />

        <div class="content-sections flex flex-col gap-8">
          {sections?.map((section, index) => {
            if (!section || !section.Component) {
              console.warn(`Section na posição ${index} está indefinida.`);
              return null;
            }

            const { Component, props } = section;
            
            return (
              <div key={index} class="section-wrapper">
                <Component {...props} />
              </div>
            );
          })}
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