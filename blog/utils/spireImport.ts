/**
 * Utilities for converting Spire API data to Deco BlogPost format and for
 * writing Spire posts to Deco's native block storage (Studio CMS visibility).
 *
 * Block storage path: .deco/blocks/collections%2Fblog%2Fposts%2F{slug}.json
 *
 * Architecture:
 *   • syncPostToBlocks  — writes post metadata + btoa-safe content to .deco/blocks/
 *   • fetchSpireContent — fetches live HTML from public Spire API at render time
 *   • migrateSpireBlocks — ensures all Spire blocks use the current __resolveType
 *   • File watcher (mod.ts) — detects Studio edits and syncs metadata back to Spire
 */

import { logger } from "@deco/deco/o11y";
import { join } from "std/path/mod.ts";
import { BlogPost } from "../types.ts";
import { Block, SpirePost, SpirePostSummary } from "../../spire/types.ts";
import { sanitizeHref, sanitizeHtml } from "../../spire/utils/sanitizeHtml.ts";

export const SPIRE_BASE_URL = "https://spire.blog";

/**
 * The __resolveType written into .deco/blocks/ for Spire-managed posts.
 * SpirePost.ts renders editable fields (title/excerpt/seo) and @readOnly
 * fields (image/authors/categories/date/slug) in Deco Studio.
 */
export const SPIRE_RESOLVE_TYPE = "blog/loaders/SpirePost.ts" as const;

/**
 * Set of post slugs currently being written by syncPostToBlocks.
 * The file watcher in mod.ts checks this set before calling sync-manual
 * to prevent a feedback loop: sync writes block → watcher detects change
 * → watcher would call sync-manual → which is redundant and potentially loops.
 *
 * Also exported to webhook.ts for the same reason.
 */
export const activeSyncs = new Set<string>();

// ---------------------------------------------------------------------------
// Block filesystem helpers (for Studio CMS visibility)
// ---------------------------------------------------------------------------

const BLOCKS_DIR = join(Deno.cwd(), ".deco", "blocks");

function blockFilePath(collectionPath: string): string {
  return join(BLOCKS_DIR, `${collectionPath.replace(/\//g, "%2F")}.json`);
}

export function postBlockPath(slug: string): string {
  return blockFilePath(`collections/blog/posts/${slug}`);
}

/**
 * Fetch a post from the Spire API and write it to .deco/blocks/ so it
 * appears in Deco Studio's CMS collection browser. The live site does NOT
 * depend on this — loaders fetch from the API independently.
 */
export async function syncPostToBlocks(
  blogSlug: string,
  postSlug: string,
  spireBaseUrl = SPIRE_BASE_URL,
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(
      `${spireBaseUrl}/api/blog/${encodeURIComponent(blogSlug)}/posts/${
        encodeURIComponent(postSlug)
      }`,
      { signal: AbortSignal.timeout(10_000) },
    );

    if (!res.ok) {
      return { success: false, message: `Spire API returned ${res.status}` };
    }

    const { post } = (await res.json()) as { post?: SpirePost };
    if (!post) return { success: false, message: "No post in API response" };

    const blogPost = spirePostToBlogPost(post);
    const collectionPath = `collections/blog/posts/${postSlug}`;
    const resolvable = {
      name: collectionPath,
      __resolveType: SPIRE_RESOLVE_TYPE,
      post: blogPost,
    };

    await Deno.mkdir(BLOCKS_DIR, { recursive: true });

    // Register in activeSyncs BEFORE writing so the file watcher in mod.ts
    // skips this slug and does not call sync-manual immediately after the write.
    activeSyncs.add(postSlug);
    setTimeout(() => activeSyncs.delete(postSlug), 15_000);

    await Deno.writeTextFile(
      blockFilePath(collectionPath),
      JSON.stringify(resolvable, null, 2),
    );

    logger.info(`[SpireSync] Wrote block for "${postSlug}"`);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.error(`[SpireSync] Failed to sync "${postSlug}":`, err);
    return { success: false, message: msg };
  }
}

/**
 * Ensures all Spire post blocks use SPIRE_RESOLVE_TYPE as __resolveType.
 * Spire posts are identified by the presence of post.spirePostId (not by
 * __resolveType, which may have changed across versions). Runs on startup.
 */
export async function migrateSpireBlocks(): Promise<void> {
  try {
    for await (const entry of Deno.readDir(BLOCKS_DIR)) {
      if (
        !entry.isFile || !entry.name.includes("posts%2F") ||
        !entry.name.endsWith(".json")
      ) {
        continue;
      }
      const path = join(BLOCKS_DIR, entry.name);
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(await Deno.readTextFile(path));
      } catch {
        continue;
      }
      const post = data.post as Record<string, unknown> | undefined;
      if (!post?.spirePostId) continue; // Not a Spire post — skip
      if (data.__resolveType === SPIRE_RESOLVE_TYPE) continue; // Already correct
      data.__resolveType = SPIRE_RESOLVE_TYPE;
      await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
      logger.info(`[SpireMigrate] Fixed __resolveType for "${entry.name}"`);
    }
  } catch {
    // BLOCKS_DIR may not exist yet — harmless
  }
}

/**
 * Remove a post block when it is unpublished from Spire.
 */
export async function removePostBlock(slug: string): Promise<void> {
  try {
    await Deno.remove(postBlockPath(slug));
    logger.info(`[SpireSync] Removed block for unpublished post "${slug}"`);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }
}

/**
 * Replace non-Latin1 chars (charCode > 255) with ASCII approximations so that
 * block JSON is safe for Deco Studio's btoa-based preview URL encoding.
 * Only typography chars are affected (em-dash, en-dash, curly quotes, ellipsis).
 * Standard Portuguese accented chars (a-tilde, e-acute, etc.) are Latin1 and
 * pass through unchanged.
 */
function toLatinSafe(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code <= 255) {
      out += s[i];
      continue;
    }
    if (code === 0x2014 || code === 0x2013) {
      out += "--";
      continue;
    }
    if (code === 0x2018 || code === 0x2019) {
      out += String.fromCharCode(39);
      continue;
    }
    if (code === 0x201C || code === 0x201D) {
      out += String.fromCharCode(34);
      continue;
    }
    if (code === 0x2026) {
      out += "...";
      continue;
    }
  }
  return out;
}

/**
 * Convert a full Spire API post (with blocks) to a Deco BlogPost.
 *
 * The `content` field is stored as a btoa-safe approximation (non-Latin1
 * typography chars like em-dash are converted to ASCII equivalents). This is
 * used as a fallback by BlogPostPage.ts when the Spire API is unavailable
 * (e.g. scheduled posts with a future publish date). When the API IS available,
 * BlogPostPage.ts fetches fresh content directly via fetchSpireContent().
 */
export function spirePostToBlogPost(post: SpirePost): BlogPost {
  return {
    id: post.id,
    title: post.version.title,
    excerpt: post.version.description,
    image: post.version.imageUrl || undefined,
    alt: post.version.title || undefined,
    authors: (post.authors ?? []).map((a) => ({
      name: a.name,
      email: "",
      avatar: a.avatarUrl ?? undefined,
    })),
    categories: (post.tags ?? []).map((t) => ({ name: t.name, slug: t.slug })),
    date: (post.publishedAt ?? new Date().toISOString()).slice(0, 10),
    slug: post.slug,
    seo: {
      title: post.version.metaTitle || post.version.title,
      description: post.version.metaDescription || post.version.description,
      image: post.version.imageUrl || undefined,
    },
    content: toLatinSafe(compileBlocksToHtml(post.version.blocks)),
    spirePostId: post.id,
  };
}

/**
 * Fetch and compile HTML content for a Spire post from the public API.
 * Returns null when the post is unavailable (404 means scheduled for a future
 * date, still in draft, or temporarily unavailable). BlogPostPage.ts falls back
 * to the btoa-safe content cached in the block file when this returns null.
 */
export async function fetchSpireContent(
  blogSlug: string,
  postSlug: string,
  spireBase: string,
): Promise<string | null> {
  const res = await fetch(
    `${spireBase}/api/blog/${encodeURIComponent(blogSlug)}/posts/${
      encodeURIComponent(postSlug)
    }`,
    { signal: AbortSignal.timeout(10_000) },
  );
  if (!res.ok) return null; // null = unavailable (scheduled/draft), not "empty content"
  const { post } = await res.json() as { post?: SpirePost };
  return post ? compileBlocksToHtml(post.version.blocks) : null;
}

/** Convert a Spire post summary (listing) to a Deco BlogPost. */
export function spirePostSummaryToBlogPost(
  summary: SpirePostSummary,
): BlogPost {
  return {
    id: summary.id,
    title: summary.title,
    excerpt: summary.description,
    image: summary.imageUrl,
    alt: summary.title,
    authors: [],
    categories: [],
    date: (summary.publishedAt ?? new Date().toISOString()).slice(0, 10),
    slug: summary.slug,
    spirePostId: summary.id,
  };
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
  context?: string,
): T {
  if (typeof value !== "string") return fallback;
  try {
    const parsed = JSON.parse(value);
    if (validator && !validator(parsed)) return fallback;
    return parsed as T;
  } catch {
    const preview = value.length > 80 ? value.slice(0, 80) + "…" : value;
    logger.warn(
      `[SpireImport] JSON parse failed${
        context ? ` (${context})` : ""
      }: ${preview}`,
    );
    return fallback;
  }
}

/**
 * Parse a string that is either a JSON array or a plain newline/comma-separated
 * list. Used for block content fields like `list.items` and `checklist.items`
 * where Spire may send either format.
 */
function parseStringList(
  value: unknown,
  context: string,
): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value !== "string" || !value.trim()) return [];

  // Try JSON array first
  const parsed = safeJsonParse<string[]>(
    value,
    null as unknown as string[],
    Array.isArray,
    context,
  );
  if (parsed !== null && Array.isArray(parsed)) return parsed;

  // Fallback: split by newlines, then by commas if single-line
  const lines = value.split("\n").map((s) => s.trim()).filter(Boolean);
  return lines.length > 1
    ? lines
    : value.split(",").map((s) => s.trim()).filter(Boolean);
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
          const items = parseStringList(content.items, "list.items");
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
          const variant =
            allowedVariants.includes(String(content.variant || "").trim())
              ? String(content.variant).trim()
              : "info";
          return `<div class="callout callout-${variant}"><strong>${
            escapeHtml(content.title)
          }</strong><p>${sanitizeHtml(content.body)}</p></div>`;
        }

        case "card-group": {
          type Card = { icon?: string; title?: string; body?: string };
          const cards = safeJsonParse<Card[]>(
            content.cards,
            [],
            Array.isArray,
            "card-group.cards",
          );
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
          const items = parseStringList(content.items, "checklist.items");
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
            : safeJsonParse<Step[]>(
              content.steps,
              [],
              Array.isArray,
              "steps.steps",
            );
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
            "stat-group.stats",
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
          const left = safeJsonParse<Side>(
            content.left,
            {},
            undefined,
            "comparison.left",
          );
          const right = safeJsonParse<Side>(
            content.right,
            {},
            undefined,
            "comparison.right",
          );
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
          if (content.html) return sanitizeHtml(content.html);
          if (content.text) return `<p>${escapeHtml(content.text)}</p>`;
          return "";
      }
    })
    .join("\n");
}
