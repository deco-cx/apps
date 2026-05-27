/**
 * Shared utilities for importing Spire blog posts into Deco's native block storage.
 * Used by both the webhook action (individual post) and syncAllPosts action (bulk).
 */

import { logger } from "@deco/deco/o11y";
import { join } from "std/path/mod.ts";
import { BlogPost } from "../types.ts";
import { Block, SpirePost } from "../../spire/types.ts";
import { sanitizeHref, sanitizeHtml } from "../../spire/utils/sanitizeHtml.ts";

export const SPIRE_BASE_URL = "https://spire.blog";
export const BLOCKS_BASE = ".deco/blocks/collections/blog/posts";

/** Build the absolute filesystem path for a post's JSON block file. */
export function postBlockPath(slug: string): string {
  return join(Deno.cwd(), BLOCKS_BASE, `${slug}.json`);
}

/** Convert a Spire API post to Deco BlogPost, ready to persist as a resolvable. */
export function spirePostToBlogPost(post: SpirePost): BlogPost {
  return {
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
    categories: post.tags.map((t) => ({ name: t.name, slug: t.slug })),
    date: post.publishedAt ?? new Date().toISOString(),
    slug: post.slug,
    seo: {
      title: post.version.metaTitle || post.version.title,
      description: post.version.metaDescription || post.version.description,
      image: post.version.imageUrl,
    },
    content: compileBlocksToHtml(post.version.blocks),
    spirePostId: post.id,
    spireWarning:
      "This post is automatically synchronized by Spire. Any manual edits made in this form will be overwritten during the next sync.",
  };
}

/**
 * Fetch a single published post from the Spire API, convert it and write it to
 * `.deco/blocks/collections/blog/posts/<slug>.json`.
 *
 * Returns `{ success: true, path }` on success, or `{ success: false, message }` on error.
 * Does NOT set the activeSyncs flag — callers are responsible for that if needed.
 */
export async function importSpirePost(
  blogSlug: string,
  postSlug: string,
  spireUrl: string = SPIRE_BASE_URL,
  timeoutMs = 10_000,
): Promise<{ success: boolean; path?: string; message?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(
      `${spireUrl}/api/blog/${encodeURIComponent(blogSlug)}/posts/${
        encodeURIComponent(postSlug)
      }`,
      { signal: controller.signal },
    );
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      return { success: false, message: "Request to Spire API timed out" };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error",
    };
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    return {
      success: false,
      message: `Spire API returned ${response.status} for "${postSlug}"`,
    };
  }

  let body: { post?: SpirePost };
  try {
    body = (await response.json()) as { post?: SpirePost };
  } catch {
    return { success: false, message: "Failed to parse Spire API response" };
  }

  if (!body.post) {
    return {
      success: false,
      message: "No post content returned from Spire API",
    };
  }

  const blogPost = spirePostToBlogPost(body.post);
  const resolvable = {
    __resolveType: "blog/loaders/Blogpost.ts",
    post: blogPost,
  };

  try {
    const blocksDir = join(Deno.cwd(), BLOCKS_BASE);
    await Deno.mkdir(blocksDir, { recursive: true });
    const filePath = join(blocksDir, `${postSlug}.json`);
    await Deno.writeTextFile(filePath, JSON.stringify(resolvable, null, 2));
    logger.info(`[SpireImport] Imported "${postSlug}" → ${filePath}`);
    return { success: true, path: filePath };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to write post file",
    };
  }
}

// ---------------------------------------------------------------------------
// Block → HTML compiler
// ---------------------------------------------------------------------------

interface SpireBlockContent {
  html?: string;
  text?: string;
  level?: string | number;
  style?: string;
  items?: string | string[];
  cards?: string;
  stats?: string;
  left?: string;
  right?: string;
  quote?: string;
  attribution?: string;
  variant?: string;
  title?: string;
  body?: string;
  value?: string;
  label?: string;
  description?: string;
  steps?: string | Array<{ title?: string; description?: string }>;
  url?: string;
  alt?: string;
  caption?: string;
  language?: string;
  code?: string;
  href?: string;
}

function escapeHtml(value?: string): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeJsonParse<T>(
  value: unknown,
  fallback: T,
  validator?: (v: unknown) => boolean,
): T {
  if (typeof value !== "string") return fallback;
  try {
    const parsed = JSON.parse(value);
    if (validator && !validator(parsed)) return fallback;
    return parsed as T;
  } catch (e) {
    logger.error("[SpireImport] JSON parse error in block content:", e);
    return fallback;
  }
}

/** Converts Spire's modular block array to semantic HTML. XSS-safe. */
export function compileBlocksToHtml(blocks?: Block[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  return [...blocks]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((block) => {
      const content = (block.content || {}) as SpireBlockContent;

      switch (block.type) {
        case "paragraph":
          return content.html
            ? sanitizeHtml(content.html)
            : `<p>${escapeHtml(content.text)}</p>`;

        case "heading": {
          const rawLevel = String(content.level || "2").trim();
          const level = /^[1-6]$/.test(rawLevel) ? rawLevel : "2";
          return `<h${level}>${escapeHtml(content.text)}</h${level}>`;
        }

        case "list": {
          const tag = content.style === "ordered" ? "ol" : "ul";
          const items = Array.isArray(content.items)
            ? content.items
            : safeJsonParse<string[]>(content.items, [], Array.isArray);
          return `<${tag}>${
            items.map((i: string) => `<li>${sanitizeHtml(i)}</li>`).join("")
          }</${tag}>`;
        }

        case "divider":
          return "<hr />";

        case "quote":
          return `<blockquote><p>${
            escapeHtml(content.quote || content.text)
          }</p>${
            content.attribution
              ? `<cite>${escapeHtml(content.attribution)}</cite>`
              : ""
          }</blockquote>`;

        case "callout": {
          const allowedVariants = [
            "info",
            "warning",
            "success",
            "danger",
            "note",
            "tip",
            "important",
            "caution",
          ];
          const variant = allowedVariants.includes(
              String(content.variant || "").trim(),
            )
            ? String(content.variant).trim()
            : "info";
          return `<div class="callout callout-${variant}"><strong>${
            escapeHtml(content.title)
          }</strong><p>${sanitizeHtml(content.body)}</p></div>`;
        }

        case "card-group": {
          type Card = { icon?: string; title?: string; body?: string };
          const cards = safeJsonParse<Card[]>(content.cards, [], Array.isArray);
          return `<div class="card-group">${
            cards.map((c) =>
              `<div class="card">${
                c.icon
                  ? `<span class="card-icon">${escapeHtml(c.icon)}</span>`
                  : ""
              }<strong>${escapeHtml(c.title)}</strong><p>${
                sanitizeHtml(c.body)
              }</p></div>`
            ).join("")
          }</div>`;
        }

        case "checklist": {
          const items = Array.isArray(content.items)
            ? content.items
            : safeJsonParse<string[]>(content.items, [], Array.isArray);
          return `${content.title ? `<h3>${escapeHtml(content.title)}</h3>` : ""}<ul class="checklist">${
            items.map((i: string) =>
              `<li><input type="checkbox" disabled /> ${sanitizeHtml(i)}</li>`
            ).join("")
          }</ul>`;
        }

        case "steps": {
          type Step = { title?: string; description?: string };
          const steps = Array.isArray(content.steps)
            ? content.steps as Step[]
            : safeJsonParse<Step[]>(content.steps, [], Array.isArray);
          return `${content.title ? `<h3>${escapeHtml(content.title)}</h3>` : ""}<ol class="steps">${
            steps.map((s, i) =>
              `<li><strong>${i + 1}. ${escapeHtml(s.title)}</strong>${
                s.description ? `<p>${sanitizeHtml(s.description)}</p>` : ""
              }</li>`
            ).join("")
          }</ol>`;
        }

        case "stat":
          return `<div class="stat"><span class="stat-value">${
            escapeHtml(content.value)
          }</span>${
            content.label
              ? `<small class="stat-label">${escapeHtml(content.label)}</small>`
              : ""
          }${
            content.description
              ? `<p class="stat-description">${
                escapeHtml(content.description)
              }</p>`
              : ""
          }</div>`;

        case "stat-group": {
          type Stat = { value?: string; label?: string };
          const stats = safeJsonParse<Stat[]>(
            content.stats,
            [],
            Array.isArray,
          );
          return `<div class="stat-group">${
            stats.map((s) =>
              `<div class="stat"><span class="stat-value">${
                escapeHtml(s.value)
              }</span>${
                s.label
                  ? `<small class="stat-label">${escapeHtml(s.label)}</small>`
                  : ""
              }</div>`
            ).join("")
          }</div>`;
        }

        case "comparison": {
          type Side = { title?: string; items?: string[] };
          const left = safeJsonParse<Side>(content.left, {});
          const right = safeJsonParse<Side>(content.right, {});
          const renderSide = (s: Side) =>
            `<div class="comparison-side"><strong>${
              escapeHtml(s.title)
            }</strong><ul>${
              (Array.isArray(s.items) ? s.items : []).map((i) =>
                `<li>${sanitizeHtml(i)}</li>`
              ).join("")
            }</ul></div>`;
          return `<div class="comparison">${renderSide(left)}${
            renderSide(right)
          }</div>`;
        }

        case "image":
          return `<figure><img src="${sanitizeHref(content.url)}" alt="${
            escapeHtml(content.alt)
          }" />${
            content.caption
              ? `<figcaption>${escapeHtml(content.caption)}</figcaption>`
              : ""
          }</figure>`;

        case "video":
          return `<figure><video src="${
            sanitizeHref(content.url)
          }" controls></video>${
            content.caption
              ? `<figcaption>${escapeHtml(content.caption)}</figcaption>`
              : ""
          }</figure>`;

        case "code":
          return `<pre><code class="language-${escapeHtml(content.language)}">${
            escapeHtml(content.code)
          }</code></pre>`;

        case "cta":
          return `<div class="cta"><a href="${
            sanitizeHref(content.href)
          }" class="btn">${escapeHtml(content.text)}</a></div>`;

        default:
          // SystemBlock, CustomBlock, and unknown future types
          if (content.html) return sanitizeHtml(content.html);
          if (content.text) return `<p>${escapeHtml(content.text)}</p>`;
          return "";
      }
    })
    .join("\n");
}
