import { sanitizeHref } from "../../utils/sanitizeHtml.ts";

interface ShelfItem {
  name: string;
  price?: string;
  listPrice?: string;
  imageUrl?: string;
  url?: string;
  badge?: string;
}

export interface Props {
  /** Section title shown above the shelf */
  title?: string;
  /**
   * JSON-encoded ShelfItem[]
   * Each item: { name, price?, listPrice?, imageUrl?, url?, badge? }
   */
  items: ShelfItem[] | string;
}

/**
 * @title Product Shelf
 * @description Horizontally scrollable row of product cards.
 */
export default function ProductShelf({ title, items }: Props) {
  let products: ShelfItem[] = [];

  if (Array.isArray(items)) {
    products = items;
  } else if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) products = parsed;
    } catch { /* ignore */ }
  }

  if (products.length === 0) return null;

  return (
    <div class="not-prose my-10">
      {title && (
        <h3 class="text-base font-semibold tracking-tight mb-4 m-0">{title}</h3>
      )}
      <div class="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-line">
        {products.map((item, i) => {
          const safeUrl = sanitizeHref(item.url);
          const isExternal = /^https?:\/\//i.test(safeUrl);
          return (
            <div
              key={i}
              class="flex-none w-44 snap-start border border-line rounded-brand overflow-hidden bg-base"
            >
              {item.imageUrl && (
                <div class="relative overflow-hidden bg-alt aspect-square">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    class="w-full h-full object-cover block"
                  />
                  {item.badge && (
                    <span class="absolute top-2 left-2 text-[0.65rem] font-semibold px-1.5 py-0.5 rounded-full bg-accent text-inverted leading-none">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              <div class="p-3 flex flex-col gap-1">
                <span class="text-sm font-semibold leading-snug line-clamp-2">
                  {item.name}
                </span>
                <div class="flex items-baseline gap-1 flex-wrap">
                  {item.price && (
                    <span class="text-sm font-bold text-accent tabular-nums">
                      {item.price}
                    </span>
                  )}
                  {item.listPrice && item.listPrice !== item.price && (
                    <span class="text-xs text-muted line-through tabular-nums">
                      {item.listPrice}
                    </span>
                  )}
                </div>
                {safeUrl && (
                  <a
                    href={safeUrl}
                    {...(isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    class="mt-1 text-xs font-semibold text-accent no-underline hover:underline"
                  >
                    Ver produto
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
