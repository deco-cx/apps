import { useId } from "preact/hooks";

export interface PendingGate {
  id: string;
  campaignId?: string;
  postId?: string;
  gateType:
    | "seed_keyword"
    | "long_tails"
    | "brief"
    | "post_plan"
    | "product_review";
  title: string;
  reasoning: string;
  createdAt: string;
}

export interface Props {
  /**
   * @title Spire Blog Slug
   * @description Your Spire account blog slug (e.g., "miess")
   */
  blogSlug: string;
  /**
   * @title Spire Dashboard Base URL
   * @description The base URL of your Spire instance (default: https://spire.blog)
   */
  spireUrl?: string;
}

export interface AsyncProps extends Props {
  gates?: PendingGate[];
}

export const loader = async (
  props: Props,
  _req: Request,
): Promise<AsyncProps> => {
  const { blogSlug, spireUrl = "https://spire.blog" } = props;

  if (!blogSlug) {
    return { ...props, gates: [] };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

  try {
    const response = await fetch(
      `${spireUrl}/api/blog/${encodeURIComponent(blogSlug)}/gates/pending`,
      {
        signal: controller.signal,
        headers: {
          "Accept": "application/json; charset=utf-8",
        },
      },
    );
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`Failed to fetch pending gates: ${response.status}`);
    }
    const { gates } = await response.json();
    return { ...props, gates: gates || [] };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn(
        "[SpirePendingApprovals] Request timed out while fetching pending gates.",
      );
    }
    console.error(
      "[SpirePendingApprovals] Error fetching gates from Spire:",
      error,
    );
    return { ...props, gates: [] };
  }
};

export default function SpirePendingApprovals({
  blogSlug,
  spireUrl = "https://spire.blog",
  gates = [],
}: AsyncProps) {
  const id = useId();

  return (
    <div
      id={id}
      class="max-w-6xl mx-auto my-8 p-6 bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Decorative gradient blur background */}
      <div class="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div class="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-800 gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/30">
              Spire Integration
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span class="text-xs text-gray-400 font-mono">
              Status: Connected to {blogSlug}
            </span>
          </div>
          <h2 class="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Human-in-the-Loop Approvals
          </h2>
          <p class="text-xs md:text-sm text-gray-400 mt-1">
            Approve generated outlines, keywords, and draft guidelines before
            content is published to your Deco blog.
          </p>
        </div>
        <a
          href={`${spireUrl}/app/${blogSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 transition-all gap-1.5 self-start md:self-center"
        >
          Open Spire Dashboard
          <svg
            class="w-3 h-3 text-gray-400"
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
      </div>

      {/* Main Content */}
      <div class="mt-6">
        {gates.length === 0
          ? (
            <div class="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-gray-900/30 border border-gray-800/50">
              <svg
                class="w-10 h-10 text-gray-600 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 class="text-sm font-semibold text-gray-200">
                All caught up!
              </h3>
              <p class="text-xs text-gray-500 mt-1 max-w-sm">
                There are no pending Human-in-the-Loop review steps for this
                blog at the moment.
              </p>
            </div>
          )
          : (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gates.map((gate) => (
                <div
                  key={gate.id}
                  class="group flex flex-col p-4 rounded-xl bg-gray-900/40 border border-gray-800/80 hover:border-violet-500/30 hover:bg-gray-900/60 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Visual Accent Bar */}
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-violet-600/50 group-hover:bg-violet-500 transition-colors" />

                  {/* Gate Meta */}
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-800 text-gray-300 border border-gray-700/50">
                      {gate.gateType.replace("_", " ")}
                    </span>
                    <span class="text-[10px] text-gray-500 font-mono">
                      {new Date(gate.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Gate Details */}
                  <h3 class="text-sm font-semibold text-gray-100 group-hover:text-violet-400 transition-colors line-clamp-1 mb-1.5 pl-1">
                    {gate.title}
                  </h3>
                  <p class="text-xs text-gray-400 pl-1 mb-4 flex-1 line-clamp-2 leading-relaxed">
                    {gate.reasoning}
                  </p>

                  {/* Actions */}
                  <div class="flex flex-wrap gap-2 pl-1 border-t border-gray-800/50 pt-3">
                    <a
                      href={`${spireUrl}/app/${blogSlug}/campaigns`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all shadow-lg shadow-violet-600/10 hover:shadow-violet-500/20 text-center"
                    >
                      Review
                    </a>
                    <a
                      href={`${spireUrl}/app/${blogSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition-all border border-gray-700/50 text-center"
                    >
                      Quick View
                    </a>
                    <button
                      type="button"
                      data-gate-id={gate.id}
                      data-gate-type={gate.gateType === "product_review"
                        ? "post"
                        : "campaign"}
                      data-campaign-id={gate.campaignId || ""}
                      data-post-id={gate.postId || ""}
                      class="gate-approve-btn flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 text-center cursor-pointer"
                    >
                      Quick Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
        document.querySelectorAll('.gate-approve-btn').forEach(button => {
          button.addEventListener('click', async (e) => {
            e.preventDefault();
            const gateId = button.getAttribute('data-gate-id');
            const gateType = button.getAttribute('data-gate-type');
            const campaignId = button.getAttribute('data-campaign-id');
            const postId = button.getAttribute('data-post-id');
            const blogSlug = ${JSON.stringify(blogSlug)};
            
            button.disabled = true;
            button.innerText = "Approving...";
            
            try {
              const response = await fetch("/live/invoke/blog/actions/resolveSpireGate.ts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gateId, gateType, blogSlug, campaignId, postId }),
              });
              if (response.ok) {
                const data = await response.json();
                if (data.success) {
                  button.innerText = "Approved! \\u2705";
                  button.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
                  button.classList.add('bg-emerald-800', 'cursor-default');
                  setTimeout(() => window.location.reload(), 1500);
                } else {
                  button.innerText = "Failed \\u274C";
                  button.disabled = false;
                  console.error(data.message);
                  setTimeout(() => button.innerText = "Quick Approve", 2500);
                }
              } else {
                button.innerText = "Failed \\u274C";
                button.disabled = false;
                setTimeout(() => button.innerText = "Quick Approve", 2500);
              }
            } catch (err) {
              button.innerText = "Error \\u274C";
              button.disabled = false;
              setTimeout(() => button.innerText = "Quick Approve", 2500);
            }
          });
        });
      `,
        }}
      />
    </div>
  );
}
