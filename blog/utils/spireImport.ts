/**
 * Shared utilities for importing Spire blog posts into Deco's native block storage.
 * Used by both the webhook action (individual post) and syncAllPosts action (bulk).
 *
 * Block storage convention (matches Deco Admin / CMS browser):
 *   .deco/blocks/collections%2Fblog%2Fposts%2F{slug}.json
 *   .deco/blocks/collections%2Fblog%2Fcategories%2F{slug}.json
 *   .deco/blocks/collections%2Fblog%2Fauthors%2F{author-id}.json
 *
 * Each file must include a "name" field with the decoded collection path so
 * Deco Studio's CMS browser can index and display the block.
 */

import { logger } from "@deco/deco/o11y";
import { join } from "std/path/mod.ts";
import { BlogPost } from "../types.ts";
import { Block, SpirePost } from "../../spire/types.ts";
import { sanitizeHref, sanitizeHtml } from "../../spire/utils/sanitizeHtml.ts";

export const SPIRE_BASE_URL = "https://spire.blog";

/** Absolute path to the Deco blocks directory. */
export const BLOCKS_DIR_ABS = join(Deno.cwd(), ".deco", "blocks");

/**
 * Returns the absolute filesystem path for a Deco block using the native
 * URL-encoded flat filename format expected by Deco Admin.
 * e.g. "collections/blog/posts/my-slug" →
 *      ".deco/blocks/collections%2Fblog%2Fposts%2Fmy-slug.json"
 */
function blockFilePath(collectionPath: string): string {
  const encoded = collectionPath.replace(/\//g, "%2F");
  return join(BLOCKS_DIR_ABS, `${encoded}.json`);
}

/** Returns the absolute path for a synced blog post block. */
export function postBlockPath(slug: string): string {
  return blockFilePath(`collections/blog/posts/${slug}`);
}

/**
 * Writes a block JSON only if the file does not already exist.
 * Used for categories and authors to avoid overwriting admin customisations.
 */
async function upsertBlock(
  collectionPath: string,
  resolveType: string,
  data: Record<string, unknown>,
): Promise<void> {
  const filePath = blockFilePath(collectionPath);
  try {
    await Deno.stat(filePath);
    // Already exists — skip to preserve any admin customisations.
  } catch {
    const resolvable = { name: collectionPath, __resolveType: resolveType, ...data };
    try {
      await Deno.writeTextFile(filePath, JSON.stringify(resolvable, null, 2));
    } catch (err) {
      logger.error(`[SpireImport] Failed to write block "${collectionPath}":`, err);
    }
  }
}

/** Slugifies a string for use as a Deco block identifier. */
function toId(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    date: (post.publishedAt ?? new Date().toISOString()).slice(0, 10),
    slug: post.slug,
    seo: {
      title: post.version.metaTitle || post.version.title,
      description: post.version.metaDescription || post.version.description,
      image: post.version.imageUrl,
    },
    content: compileBlocksToHtml(post.version.blocks),
    spirePostId: post.id,
    spireWarning: true,
  };
}

/**
 * Fetch a single published post from the Spire API, convert it and write it to
 * the Deco-native block storage format in `.deco/blocks/`.
 *
 * Also upserts separate Category and Author blocks so they appear in the Deco
 * Studio CMS collections browser. Cleans up any legacy subdirectory-format file
 * left by older versions of this integration.
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
  const postCollectionPath = `collections/blog/posts/${postSlug}`;

  const resolvable = {
    name: postCollectionPath,
    __resolveType: "blog/loaders/Blogpost.ts",
    post: blogPost,
  };

  try {
    await Deno.mkdir(BLOCKS_DIR_ABS, { recursive: true });

    // Write the post block in Deco-native URL-encoded flat format
    const filePath = blockFilePath(postCollectionPath);
    await Deno.writeTextFile(filePath, JSON.stringify(resolvable, null, 2));
    logger.info(`[SpireImport] Imported "${postSlug}" → ${filePath}`);

    // Upsert category blocks (insert-only — never overwrite admin customisations)
    for (const cat of blogPost.categories ?? []) {
      await upsertBlock(
        `collections/blog/categories/${cat.slug}`,
        "blog/loaders/Category.ts",
        { category: { name: cat.name, slug: cat.slug } },
      );
    }

    // Upsert author blocks
    for (const author of blogPost.authors ?? []) {
      const authorId = toId(author.name) || "unknown-author";
      await upsertBlock(
        `collections/blog/authors/${authorId}`,
        "blog/loaders/Author.ts",
        {
          author: {
            name: author.name,
            email: author.email || "",
            ...(author.avatar ? { avatar: author.avatar } : {}),
          },
        },
      );
    }

    // Migrate: remove legacy subdirectory-format file from older sync versions
    const legacyPath = join(
      Deno.cwd(),
      ".deco",
      "blocks",
      "collections",
      "blog",
      "posts",
      `${postSlug}.json`,
    );
    try {
      await Deno.remove(legacyPath);
      logger.info(`[SpireImport] Removed legacy file: ${legacyPath}`);
    } catch {
      // Not found — nothing to migrate
    }

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
          return `${
            content.title ? `<h3>${escapeHtml(content.title)}</h3>` : ""
          }<ul class="checklist">${
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
          return `${
            content.title ? `<h3>${escapeHtml(content.title)}</h3>` : ""
          }<ol class="steps">${
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
