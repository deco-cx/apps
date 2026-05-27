import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
import { spirePostToBlogPost } from "../../spire/loaders/BlogPostPage.ts";
import { join } from "std/path/mod.ts";
import { SpirePost, Block } from "../../spire/types.ts";

export interface Props {
  postId: string;
  postSlug: string;
  blogSlug: string;
  event: "post.published" | "post.unpublished" | "post.saved";
}

/**
 * @title Import Spire Post Webhook
 * @description Securely receives a post update webhook from Spire, fetches the full post, compiles it to HTML, and saves it natively in Deco.
 */
export default async function importSpirePost(
  { postSlug, blogSlug, event }: Props,
  req: Request,
  _ctx: AppContext,
): Promise<{ success: boolean; path?: string; message?: string }> {
  try {
    // 1. Security Authorization Header Verification
    const expectedSecret =
      (typeof _ctx.spireWebhookSecret === "string"
        ? _ctx.spireWebhookSecret
        : _ctx.spireWebhookSecret?.get?.()) ||
      Deno.env.get("SPIRE_WEBHOOK_SECRET");
    if (expectedSecret) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
        return { 
          success: false, 
          message: "Unauthorized: Webhook token verification failed." 
        };
      }
    } else {
      console.warn("[Webhook] Warning: SPIRE_WEBHOOK_SECRET is not configured. Webhook request authorized without verification (development mode).");
    }

    if (event === "post.unpublished") {
      // Handle unpublishing/deletion: Remove block file
      const blocksDir = join(Deno.cwd(), ".deco", "blocks", "collections", "blog", "posts");
      const filePath = join(blocksDir, `${postSlug}.json`);
      try {
        await Deno.remove(filePath);
        console.info(`[Webhook] Successfully removed unpublished post at: ${filePath}`);
        return { success: true, message: "Post unpublished successfully" };
      } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
          return { success: true, message: "Post already unpublished or not found" };
        }
        throw err;
      }
    }

    // 2. Fetch full post content from Spire API
    const response = await fetch(`https://spire.blog/api/blog/${blogSlug}/posts/${postSlug}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch post from Spire: ${response.status} ${response.statusText}`);
    }

    const { post } = (await response.json()) as { post?: SpirePost };
    if (!post) {
      throw new Error("No post content returned from Spire API");
    }

    // 3. Convert SpirePost schema to BlogPost
    const baseBlogPost = spirePostToBlogPost(post, {});

    // 4. Compile Spire content blocks into a clean semantic HTML string for Deco Admin WYSIWYG
    const htmlContent = compileBlocksToHtml(post.version.blocks);

    const blogPost: BlogPost = {
      ...baseBlogPost,
      content: htmlContent,
      spirePostId: post.id,
      spireWarning: "This post is automatically synchronized by Spire. Any manual edits made in this form will be overwritten during the next sync.",
    };

    // 5. Build Deco Block Resolvable
    const resolvable = {
      __resolveType: "blog/loaders/Blogpost.ts",
      post: blogPost,
    };

    // 6. Write natively to filesystem as local JSON block (.deco/blocks/collections/blog/posts/<slug>.json)
    const blocksDir = join(Deno.cwd(), ".deco", "blocks", "collections", "blog", "posts");
    await Deno.mkdir(blocksDir, { recursive: true });
    const filePath = join(blocksDir, `${postSlug}.json`);
    await Deno.writeTextFile(filePath, JSON.stringify(resolvable, null, 2));

    console.info(`[Webhook] Successfully imported post and saved to ${filePath}`);

    return { 
      success: true, 
      path: filePath, 
      message: "Post imported and compiled successfully" 
    };
  } catch (error) {
    console.error("[Webhook] Error importing Spire post:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Internal Server Error" 
    };
  }
}
export interface SpireBlockContent {
  html?: string;
  text?: string;
  level?: string | number;
  style?: string;
  items?: string | string[];
  quote?: string;
  attribution?: string;
  variant?: string;
  title?: string;
  body?: string;
  steps?: string | Array<{ title?: string; description?: string }>;
  url?: string;
  alt?: string;
  caption?: string;
  language?: string;
  code?: string;
  href?: string;
}

/**
 * Compiles Spire's modular block arrays to semantic standard HTML
 */
function compileBlocksToHtml(blocks?: Block[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  const sorted = [...blocks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return sorted.map((block) => {
    const content = (block.content || {}) as SpireBlockContent;
    switch (block.type) {
      case "paragraph":
        return content.html ? content.html : `<p>${content.text || ""}</p>`;
      case "heading": {
        const level = content.level || "2";
        return `<h${level}>${content.text || ""}</h${level}>`;
      }
      case "list": {
        const style = content.style === "ordered" ? "ol" : "ul";
        const items = Array.isArray(content.items) 
          ? content.items 
          : typeof content.items === "string" 
            ? JSON.parse(content.items) as string[]
            : [];
        const listItems = items.map((item: string) => `<li>${item}</li>`).join("");
        return `<${style}>${listItems}</${style}>`;
      }
      case "divider":
        return "<hr />";
      case "quote":
        return `<blockquote><p>${content.quote || content.text || ""}</p>${content.attribution ? `<cite>${content.attribution}</cite>` : ""}</blockquote>`;
      case "callout": {
        const variant = content.variant || "info";
        return `<div class="callout callout-${variant}"><strong>${content.title || ""}</strong><p>${content.body || ""}</p></div>`;
      }
      case "checklist": {
        const checkItems = Array.isArray(content.items) 
          ? content.items 
          : typeof content.items === "string" 
            ? JSON.parse(content.items) as string[]
            : [];
        const checkList = checkItems.map((item: string) => `<li><input type="checkbox" disabled /> ${item}</li>`).join("");
        return `<ul class="checklist">${content.title ? `<h3>${content.title}</h3>` : ""}${checkList}</ul>`;
      }
      case "steps": {
        const stepItems = Array.isArray(content.steps)
          ? content.steps
          : typeof content.steps === "string"
            ? JSON.parse(content.steps) as Array<{ title?: string; description?: string }>
            : [];
        const stepList = stepItems.map((step: { title?: string; description?: string }, index: number) => `<li><strong>${index + 1}. ${step.title || ""}</strong>${step.description ? `<p>${step.description}</p>` : ""}</li>`).join("");
        return `<ol class="steps">${content.title ? `<h3>${content.title}</h3>` : ""}${stepList}</ol>`;
      }
      case "image":
        return `<figure><img src="${content.url || ""}" alt="${content.alt || ""}" />${content.caption ? `<figcaption>${content.caption}</figcaption>` : ""}</figure>`;
      case "video":
        return `<figure><video src="${content.url || ""}" controls></video>${content.caption ? `<figcaption>${content.caption}</figcaption>` : ""}</figure>`;
      case "code":
        return `<pre><code class="language-${content.language || ""}">${content.code || ""}</code></pre>`;
      case "cta":
        return `<div class="cta"><a href="${content.href || "#"}" class="btn">${content.text || ""}</a></div>`;
      default:
        if (content.html) return content.html;
        if (content.text) return `<p>${content.text}</p>`;
        return "";
    }
  }).join("\n");
}
