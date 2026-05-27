/** @jsxRuntime automatic */
/** @jsxImportSource preact */

import { useId } from "preact/hooks";
import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Spire Base URL
   * @description Override only if using a self-hosted Spire instance.
   * @default https://spire.blog
   */
  spireUrl?: string;
}

interface LoaderData extends Props {
  blogSlug?: string;
  isConfigured: boolean;
}

export const loader = (
  props: Props,
  _req: Request,
  ctx: AppContext,
): LoaderData => ({
  ...props,
  blogSlug: ctx.allowedBlogSlug,
  isConfigured: !!ctx.allowedBlogSlug && !!(
    typeof ctx.spireWebhookSecret === "string"
      ? ctx.spireWebhookSecret
      : ctx.spireWebhookSecret?.get?.()
  ),
});

/**
 * @title Spire Sync Dashboard
 * @description Admin panel for bulk-importing all published Spire posts into Deco
 *   native block storage. Requires Spire Blog Slug and Webhook Secret to be configured
 *   in the blog app settings.
 */
export default function SpireSync(
  { blogSlug, isConfigured, spireUrl = "https://spire.blog" }: LoaderData,
) {
  const id = useId();

  return (
    <div
      id={id}
      class="max-w-3xl mx-auto my-8 p-6 bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background accents */}
      <div class="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div class="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div class="flex items-center gap-3 mb-6 pb-5 border-b border-gray-800">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/30">
            Spire
          </span>
          <span
            class={`w-2 h-2 rounded-full ${
              isConfigured ? "bg-emerald-500 animate-pulse" : "bg-yellow-500"
            }`}
          />
        </div>
        <div>
          <h2 class="text-lg font-bold tracking-tight">
            Sync Posts from Spire
          </h2>
          <p class="text-xs text-gray-400">
            {isConfigured
              ? `Connected to blog "${blogSlug}"`
              : "Spire Blog Slug or Webhook Secret not configured"}
          </p>
        </div>
        {blogSlug && (
          <a
            href={`${spireUrl}/app/${encodeURIComponent(blogSlug)}`}
            target="_blank"
            rel="noopener noreferrer"
            class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 transition-all"
          >
            Open Spire
            <svg
              class="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>

      {!isConfigured
        ? (
          <div class="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-sm text-yellow-300">
            <strong>Configuration required.</strong> Set{" "}
            <code class="font-mono text-xs bg-yellow-500/20 px-1 rounded">
              Spire Blog Slug
            </code>{" "}
            and{" "}
            <code class="font-mono text-xs bg-yellow-500/20 px-1 rounded">
              Spire Webhook Secret
            </code>{" "}
            in the blog app settings to enable sync.
          </div>
        )
        : (
          <div class="space-y-4">
            <p class="text-sm text-gray-300 leading-relaxed">
              Click <strong class="text-white">Sync All Posts</strong>{" "}
              to import every published post from{" "}
              <span class="font-mono text-violet-400">"{blogSlug}"</span>{" "}
              into Deco's native block storage. Existing posts will be updated.
            </p>

            {/* Sync button + result area */}
            <div
              id={`${id}-result`}
              class="hidden rounded-xl bg-gray-900/60 border border-gray-800 p-4 text-sm"
            />

            <button
              type="button"
              id={`${id}-btn`}
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white transition-all shadow-lg shadow-violet-600/20"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Sync All Posts
            </button>

            <p class="text-xs text-gray-500">
              Posts imported here will be stored in{" "}
              <code class="font-mono">
                .deco/blocks/collections/blog/posts/
              </code>{" "}
              and will appear in the CMS collections browser.
            </p>
          </div>
        )}

      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var btn = document.getElementById(${JSON.stringify(`${id}-btn`)});
  var resultEl = document.getElementById(${JSON.stringify(`${id}-result`)});
  if (!btn || !resultEl) return;

  btn.addEventListener('click', async function() {
    btn.disabled = true;
    btn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Syncing…';
    resultEl.className = resultEl.className.replace('hidden', '').trim();
    resultEl.innerHTML = '<span class="text-gray-400">Importing posts from Spire, please wait…</span>';

    try {
      var res = await fetch('/live/invoke/blog/actions/syncAllPosts.ts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      var data = await res.json();

      if (data.success || data.synced > 0) {
        resultEl.innerHTML =
          '<span class="text-emerald-400 font-semibold">✓ ' + (data.message || 'Sync complete') + '</span>' +
          (data.errors && data.errors.length > 0
            ? '<details class="mt-2"><summary class="text-xs text-gray-400 cursor-pointer">Show errors (' + data.errors.length + ')</summary><pre class="text-xs text-red-400 mt-1 overflow-auto max-h-32">' + data.errors.join('\\n') + '</pre></details>'
            : '');
      } else {
        resultEl.innerHTML =
          '<span class="text-red-400 font-semibold">✗ ' + (data.message || 'Sync failed') + '</span>';
      }
    } catch (err) {
      resultEl.innerHTML = '<span class="text-red-400">Error: ' + String(err) + '</span>';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Sync All Posts';
    }
  });
})();
`,
        }}
      />
    </div>
  );
}
