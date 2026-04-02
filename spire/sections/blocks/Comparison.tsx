import { sanitizeHtml } from "../../utils/sanitizeHtml.ts";

type Col = { title: string; items: string[] };

export interface Props {
  /** JSON-encoded Col */
  left: string;
  /** JSON-encoded Col */
  right: string;
}

export default function Comparison({ left, right }: Props) {
  let leftCol: Col = { title: "Option A", items: [] };
  let rightCol: Col = { title: "Option B", items: [] };
  try {
    const parsed = JSON.parse(left ?? "{}");
    leftCol = {
      title: typeof parsed?.title === "string" ? parsed.title : "Option A",
      items: Array.isArray(parsed?.items) ? parsed.items : [],
    };
  } catch { /* ignore */ }
  try {
    const parsed = JSON.parse(right ?? "{}");
    rightCol = {
      title: typeof parsed?.title === "string" ? parsed.title : "Option B",
      items: Array.isArray(parsed?.items) ? parsed.items : [],
    };
  } catch { /* ignore */ }

  return (
    <div class="grid grid-cols-2 gap-px bg-line border border-line rounded-brand my-8 overflow-hidden">
      {/* Left column — pros */}
      <div class="bg-base p-5 sm:p-6">
        <div class="text-xs font-semibold tracking-caps uppercase pb-4 border-b-2 border-line mb-4 text-base">
          {leftCol.title}
        </div>
        <ul class="list-none p-0 m-0 flex flex-col gap-3">
          {leftCol.items.map((item, j) => (
            <li key={j} class="flex items-start gap-2.5 text-sm leading-snug">
              <span
                class="flex-shrink-0 text-emerald-500 font-bold mt-px leading-none"
                aria-hidden="true"
              >
                ✓
              </span>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }} />
            </li>
          ))}
        </ul>
      </div>

      {/* Right column — cons */}
      <div class="bg-alt p-5 sm:p-6">
        <div class="text-xs font-semibold tracking-caps uppercase pb-4 border-b-2 border-line mb-4 text-base">
          {rightCol.title}
        </div>
        <ul class="list-none p-0 m-0 flex flex-col gap-3">
          {rightCol.items.map((item, j) => (
            <li key={j} class="flex items-start gap-2.5 text-sm leading-snug">
              <span
                class="flex-shrink-0 text-tertiary font-bold mt-px leading-none"
                aria-hidden="true"
              >
                ✕
              </span>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
