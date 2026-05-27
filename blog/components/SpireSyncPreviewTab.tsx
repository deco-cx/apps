/** @jsxRuntime automatic */
/** @jsxImportSource preact */

import { useId } from "preact/hooks";

export interface Props {
  isConfigured: boolean;
  blogSlug?: string;
  spireUrl?: string;
  syncSecret?: string;
}

/**
 * Interactive Spire sync panel rendered inside the Blog app preview tab in Deco Studio.
 * The preview iframe is served by the Deco site itself, so /live/invoke/ calls work correctly.
 */
export default function SpireSyncPreviewTab({
  isConfigured,
  blogSlug,
  spireUrl = "https://spire.blog",
  syncSecret,
}: Props) {
  const id = useId();

  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        color: "#d1d5db",
        lineHeight: "1.6",
        background: "#0a0a0a",
        minHeight: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            background: "rgba(139,92,246,0.15)",
            color: "#a78bfa",
            border: "1px solid rgba(139,92,246,0.3)",
          }}
        >
          Spire
        </span>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isConfigured ? "#10b981" : "#f59e0b",
            display: "inline-block",
            boxShadow: isConfigured ? "0 0 6px #10b981" : "0 0 6px #f59e0b",
          }}
        />
        <span style={{ color: "#9ca3af", fontSize: "12px" }}>
          {isConfigured ? `Connected · ${blogSlug}` : "Not configured"}
        </span>
      </div>

      {!isConfigured
        ? (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "8px",
              background: "rgba(245,158,11,0.07)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#fcd34d",
              fontSize: "12px",
              marginBottom: "16px",
            }}
          >
            <strong>Setup required.</strong> Configure{" "}
            <code
              style={{
                fontFamily: "monospace",
                background: "rgba(255,255,255,0.08)",
                padding: "1px 5px",
                borderRadius: "3px",
              }}
            >
              Spire Blog Slug
            </code>{" "}
            and{" "}
            <code
              style={{
                fontFamily: "monospace",
                background: "rgba(255,255,255,0.08)",
                padding: "1px 5px",
                borderRadius: "3px",
              }}
            >
              Spire Webhook Secret
            </code>{" "}
            in the app settings above.
          </div>
        )
        : (
          <>
            <p
              style={{
                color: "#9ca3af",
                marginBottom: "16px",
                fontSize: "12px",
              }}
            >
              Import all published posts from{" "}
              <strong style={{ color: "#a78bfa" }}>{blogSlug}</strong>{" "}
              into Deco's native block storage. Posts will appear in the CMS
              collections browser.
            </p>

            {/* Result area */}
            <div
              id={`${id}-result`}
              style={{
                display: "none",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "12px",
                marginBottom: "12px",
              }}
            />

            {/* Sync button */}
            <button
              type="button"
              id={`${id}-btn`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#7c3aed",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              <svg
                width="14"
                height="14"
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

            <p
              style={{ color: "#4b5563", fontSize: "11px", marginTop: "12px" }}
            >
              Posts are stored in{" "}
              <code style={{ fontFamily: "monospace", color: "#6b7280" }}>
                .deco/blocks/collections/blog/posts/
              </code>
            </p>
          </>
        )}

      {/* Webhook URL reference */}
      <div
        style={{
          marginTop: "24px",
          padding: "12px 14px",
          borderRadius: "8px",
          background: "rgba(16,185,129,0.05)",
          border: "1px solid rgba(16,185,129,0.15)",
          fontSize: "11px",
          color: "#6ee7b7",
        }}
      >
        Webhook URL:{" "}
        <code style={{ fontFamily: "monospace", color: "#a7f3d0" }}>
          https://your-site.deco.site/live/invoke/blog/actions/webhook.ts
        </code>
        {blogSlug && (
          <>
            {" · "}
            <a
              href={`${spireUrl}/app/${encodeURIComponent(blogSlug)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#a78bfa", textDecoration: "none" }}
            >
              Open Spire Dashboard ↗
            </a>
          </>
        )}
      </div>

      {isConfigured && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  var btn = document.getElementById(${JSON.stringify(`${id}-btn`)});
  var resultEl = document.getElementById(${JSON.stringify(`${id}-result`)});
  if (!btn || !resultEl) return;

  btn.addEventListener('click', async function() {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    btn.innerHTML = '<svg width="14" height="14" class="spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Syncing…';
    resultEl.style.display = 'block';
    resultEl.style.color = '#9ca3af';
    resultEl.innerHTML = 'Importing posts from Spire, please wait…';

    try {
      var secret = ${JSON.stringify(syncSecret ?? "")};
      var headers = { 'Content-Type': 'application/json' };
      if (secret) headers['Authorization'] = 'Bearer ' + secret;
      var res = await fetch('/live/invoke/blog/actions/syncAllPosts.ts', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({}),
      });
      var data = await res.json();

      if (data.success || data.synced > 0) {
        resultEl.style.color = '#6ee7b7';
        resultEl.innerHTML = '✓ ' + (data.message || 'Sync complete');
      } else {
        resultEl.style.color = '#f87171';
        resultEl.innerHTML = '✗ ' + (data.message || 'Sync failed');
      }
    } catch (err) {
      resultEl.style.color = '#f87171';
      resultEl.innerHTML = 'Error: ' + String(err);
    } finally {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.innerHTML = '<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Sync All Posts';
    }
  });

  // Spin animation
  var style = document.createElement('style');
  style.textContent = '.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
})();
`,
          }}
        />
      )}
    </div>
  );
}
