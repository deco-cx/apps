/** @jsxRuntime automatic */
/** @jsxImportSource preact */

import { AppContext } from "../mod.ts";

interface LoaderData {
  blogSlug?: string;
  isConnected: boolean;
  spireUrl: string;
}

export const loader = (
  _props: Record<never, never>,
  _req: Request,
  ctx: AppContext,
): LoaderData => ({
  blogSlug: ctx.allowedBlogSlug,
  isConnected: !!ctx.allowedBlogSlug,
  spireUrl: (ctx.spireUrl ?? "https://spire.blog").replace(/\/$/, ""),
});

/**
 * @title Spire Connection Status
 * @description Shows the current Spire integration status. When a Spire Blog Slug is
 *   configured, blog posts are fetched live from the Spire API — no manual sync needed.
 */
export default function SpireSync(
  { blogSlug, isConnected, spireUrl }: LoaderData,
) {
  return (
    <div class="max-w-2xl mx-auto my-8 p-6 bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative">
      <div class="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div class="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div class="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
        <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/30">
          Spire
        </span>
        <h2 class="text-base font-semibold text-white">Spire Integration</h2>
      </div>

      {isConnected
        ? (
          <div class="space-y-4">
            {/* Status */}
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span class="text-sm text-gray-300">
                Connected to{" "}
                <span class="font-medium text-white">{blogSlug}</span>
              </span>
            </div>

            <p class="text-xs text-gray-400 leading-relaxed">
              Blog posts from Spire are fetched in real‑time from the API and
              appear alongside your native Deco posts automatically. No sync
              required.
            </p>

            {/* Link to Spire dashboard */}
            <a
              href={`${spireUrl}/app/${encodeURIComponent(blogSlug ?? "")}`}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-colors"
            >
              Open Spire dashboard →
            </a>
          </div>
        )
        : (
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-gray-500" />
              <span class="text-sm text-gray-400">Not connected</span>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">
              Set a{" "}
              <span class="font-medium text-gray-300">Spire Blog Slug</span>
              {" "}
              in the blog app settings to enable real‑time Spire post
              integration.
            </p>
          </div>
        )}
    </div>
  );
}
