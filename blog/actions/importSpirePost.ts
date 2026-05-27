import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
import { join } from "std/path/mod.ts";
import { SpirePost, Block } from "../../spire/types.ts";
import { sanitizeHtml, sanitizeHref } from "../../spire/utils/sanitizeHtml.ts";

export interface Props {
  postId: string;
  postSlug: string;
  blogSlug: string;
  event: "post.published" | "post.unpublished" | "event.saved" | "post.saved";
}

/**
 * @title Import Spire Post Webhook
 * @description Securely receives a post update webhook from Spire, fetches the full post, compiles it to HTML, and saves it natively in Deco.
 */
export default async function importSpirePost(
  { postSlug, blogSlug, event }: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; path?: string; message?: string }> {
  try {
    // 1. Security Authorization Header Verification
    const expectedSecret =
      (typeof ctx.spireWebhookSecret === "string"
        ? ctx.spireWebhookSecret
        : ctx.spireWebhookSecret?.get?.()) ||
      Deno.env.get("SPIRE_WEBHOOK_SECRET");
    if (!expectedSecret) {
      return {
        success: false,
        message: "Unauthorized: webhook secret not configured."
      };
    }
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return { 
        success: false, 
        message: "Unauthorized: Webhook token verification failed." 
      };
    }

    // 2. Validate and sanitize postSlug to prevent directory/path traversal
    if (!postSlug || typeof postSlug !== "string" || !/^[a-zA-Z0-9_-]+$/.test(postSlug)) {
      throw new Error("Invalid post slug format");
    }
    const sanitizedSlug = postSlug;

    if (event === "post.unpublished") {
      // Handle unpublishing/deletion: Remove block file
      const blocksDir = join(Deno.cwd(), ".deco", "blocks", "collections", "blog", "posts");
      const filePath = join(blocksDir, `${sanitizedSlug}.json`);
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

    // 3. Fetch full post content from Spire API with URL encoding and AbortController timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    let response;
    try {
      response = await fetch(
        `https://spire.blog/api/blog/${encodeURIComponent(blogSlug)}/posts/${encodeURIComponent(postSlug)}`,
        { signal: controller.signal }
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("Request to Spire API timed out");
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch post from Spire: ${response.status} ${response.statusText}`);
    }

    const { post } = (await response.json()) as { post?: SpirePost };
    if (!post) {
      throw new Error("No post content returned from Spire API");
    }

    // 4. Compile Spire content blocks into a clean semantic HTML string for Deco Admin WYSIWYG
    const htmlContent = compileBlocksToHtml(post.version.blocks);

    // 5. Convert SpirePost schema to native BlogPost
    const blogPost: BlogPost = {
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
      content: htmlContent,
      spirePostId: post.id,
      spireWarning: "This post is automatically synchronized by Spire. Any manual edits made in this form will be overwritten during the next sync.",
    };

    // 6. Build Deco Block Resolvable
    const resolvable = {
      __resolveType: "blog/loaders/Blogpost.ts",
      post: blogPost,
    };

    // 7. Write natively to filesystem as local JSON block (.deco/blocks/collections/blog/posts/<slug>.json)
    const blocksDir = join(Deno.cwd(), ".deco", "blocks", "collections", "blog", "posts");
    await Deno.mkdir(blocksDir, { recursive: true });
    const filePath = join(blocksDir, `${sanitizedSlug}.json`);
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
 * Helper to escape HTML in plain text strings
 */
function escapeHtml(value?: string): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Helper to robustly parse JSON strings with fallbacks
 */
function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.error("[Webhook] JSON parse error:", e);
    return fallback;
  }
}

/**
 * Compiles Spire's modular block arrays to semantic standard HTML with XSS prevention
 */
function compileBlocksToHtml(blocks?: Block[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  const sorted = [...blocks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return sorted.map((block) => {
    const content = (block.content || {}) as SpireBlockContent;
    switch (block.type) {
      case "paragraph":
        return content.html ? sanitizeHtml(content.html) : `<p>${escapeHtml(content.text)}</p>`;
      case "heading": {
        const level = content.level || "2";
        return `<h${level}>${escapeHtml(content.text)}</h${level}>`;
      }
      case "list": {
        const style = content.style === "ordered" ? "ol" : "ul";
        const items = Array.isArray(content.items) 
          ? content.items 
          : safeJsonParse<string[]>(content.items, []);
        const listItems = items.map((item: string) => `<li>${sanitizeHtml(item)}</li>`).join("");
        return `<${style}>${listItems}</${style}>`;
      }
      case "divider":
        return "<hr />";
      case "quote":
        return `<blockquote><p>${escapeHtml(content.quote || content.text)}</p>${content.attribution ? `<cite>${escapeHtml(content.attribution)}</cite>` : ""}</blockquote>`;
      case "callout": {
        const variant = content.variant || "info";
        return `<div class="callout callout-${variant}"><strong>${escapeHtml(content.title)}</strong><p>${sanitizeHtml(content.body)}</p></div>`;
      }
      case "checklist": {
        const checkItems = Array.isArray(content.items) 
          ? content.items 
          : safeJsonParse<string[]>(content.items, []);
        const checkList = checkItems.map((item: string) => `<li><input type="checkbox" disabled /> ${sanitizeHtml(item)}</li>`).join("");
        return `<ul class="checklist">${content.title ? `<h3>${escapeHtml(content.title)}</h3>` : ""}${checkList}</ul>`;
      }
      case "steps": {
        const stepItems = Array.isArray(content.steps)
          ? content.steps
          : safeJsonParse<Array<{ title?: string; description?: string }>>(content.steps, []);
        const stepList = stepItems.map((step: { title?: string; description?: string }, index: number) => `<li><strong>${index + 1}. ${escapeHtml(step.title)}</strong>${step.description ? `<p>${sanitizeHtml(step.description)}</p>` : ""}</li>`).join("");
        return `<ol class="steps">${content.title ? `<h3>${escapeHtml(content.title)}</h3>` : ""}${stepList}</ol>`;
      }
      case "image":
        return `<figure><img src="${sanitizeHref(content.url)}" alt="${escapeHtml(content.alt)}" />${content.caption ? `<figcaption>${escapeHtml(content.caption)}</figcaption>` : ""}</figure>`;
      case "video":
        return `<figure><video src="${sanitizeHref(content.url)}" controls></video>${content.caption ? `<figcaption>${escapeHtml(content.caption)}</figcaption>` : ""}</figure>`;
      case "code":
        return `<pre><code class="language-${escapeHtml(content.language)}">${escapeHtml(content.code)}</code></pre>`;
      case "cta":
        return `<div class="cta"><a href="${sanitizeHref(content.href)}" class="btn">${escapeHtml(content.text)}</a></div>`;
      default:
        if (content.html) return sanitizeHtml(content.html);
        if (content.text) return `<p>${escapeHtml(content.text)}</p>`;
        return "";
    }
  }).join("\n");
}

