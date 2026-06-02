import { sanitizeHtml } from "../../utils/sanitizeHtml.ts";

type Card = { icon?: string; title: string; body: string };

export interface Props {
  /** JSON-encoded Card[] (max 3) */
  cards: Card[] | string;
}

const GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
};

export default function CardGroup({ cards }: Props) {
  let items: Card[] = [];

  if (Array.isArray(cards)) {
    items = cards;
  } else if (typeof cards === "string") {
    try {
      const parsed = JSON.parse(cards);
      if (Array.isArray(parsed)) items = parsed;
    } catch { /* ignore */ }
  }

  const clamped = items.slice(0, 3);
  const gridCols = GRID_CLASS[clamped.length] ?? GRID_CLASS[3];

  return (
    <div class={`grid gap-4 my-10 ${gridCols}`}>
      {clamped.map((card, i) => (
        <div
          key={i}
          class="flex flex-col gap-3 p-6 sm:p-8 bg-alt border border-line rounded-brand transition-shadow hover:shadow-brand"
        >
          {card.icon && (
            <div
              class="flex items-center justify-center w-9 h-9 text-lg bg-base border border-line rounded-brand-sm flex-shrink-0 leading-none"
              aria-hidden="true"
            >
              {card.icon}
            </div>
          )}
          <strong
            class="text-[1.0625rem] font-semibold leading-snug"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.title) }}
          />
          <p
            class="text-sm leading-normal [text-wrap:pretty] m-0"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.body) }}
          />
        </div>
      ))}
    </div>
  );
}
