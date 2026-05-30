/** @jsxRuntime automatic */
/** @jsxImportSource preact */

export interface Props {
  isConfigured: boolean;
  blogSlug?: string;
  spireUrl?: string;
}

/**
 * Status panel rendered inside the Blog app preview tab in Deco Studio.
 * Shows the Spire connection state and links to the Spire dashboard.
 */
export default function SpireSyncPreviewTab({
  isConfigured,
  blogSlug,
  spireUrl = "https://spire.blog",
}: Props) {
  const base = spireUrl.replace(/\/$/, "");

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
            }}
          >
            <strong>Setup required.</strong> Set a{" "}
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
            in the app settings to enable live Spire post integration.
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
              Posts from{" "}
              <strong style={{ color: "#a78bfa" }}>{blogSlug}</strong>{" "}
              are fetched live from the Spire API and merged with your native
              Deco posts automatically. No manual sync needed.
            </p>

            <a
              href={`${base}/app/${encodeURIComponent(blogSlug ?? "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(124,58,237,0.15)",
                color: "#a78bfa",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid rgba(124,58,237,0.3)",
                textDecoration: "none",
              }}
            >
              Open Spire Dashboard ↗
            </a>
          </>
        )}

      {/* Webhook info */}
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
        Webhook URL for Spire notifications (configure in Spire Settings):{" "}
        <code style={{ fontFamily: "monospace", color: "#a7f3d0" }}>
          https://your-site.deco.site/live/invoke/blog/actions/webhook.ts
        </code>
      </div>
    </div>
  );
}
