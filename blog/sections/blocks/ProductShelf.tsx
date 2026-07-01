import type { Product } from "../../../commerce/types.ts";

export interface Props {
  title?: string;
  /** Resolved by the referenced productList loader (e.g. vtex/loaders/intelligentSearch/productList.ts) */
  products?: Product[] | null;
}

const GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

function formatPrice(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: currency ? "currency" : "decimal",
      currency: currency || undefined,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

export default function ProductShelf({ title, products }: Props) {
  const items = Array.isArray(products) ? products : [];
  if (items.length === 0) return null;

  const cols = Math.min(items.length, 4);
  const gridCols = GRID_CLASS[cols] ?? GRID_CLASS[4];

  return (
    <div class="my-10">
      {title && (
        <h3 class="font-display text-[var(--text-xl)] font-normal tracking-snug mb-4">
          {title}
        </h3>
      )}
      <div class={`grid gap-4 ${gridCols}`}>
        {items.map((product, i) => {
          const name = product.isVariantOf?.name ?? product.name ?? "";
          const image = product.image?.[0]?.url;
          const offer = product.offers;
          const price = offer?.offers?.[0]?.price ?? offer?.lowPrice;
          const currency = offer?.priceCurrency;

          const card = (
            <>
              <div class="aspect-square overflow-hidden bg-alt border border-line rounded-brand-sm">
                {image
                  ? (
                    <img
                      src={image}
                      alt={product.image?.[0]?.alternateName ?? name}
                      loading="lazy"
                      class="w-full h-full object-contain block"
                    />
                  )
                  : (
                    <div class="w-full h-full flex items-center justify-center text-xs text-tertiary">
                      —
                    </div>
                  )}
              </div>
              <div class="flex flex-col gap-1 mt-3">
                <span class="text-sm leading-snug [text-wrap:pretty] line-clamp-2">
                  {name}
                </span>
                {typeof price === "number" && (
                  <span class="text-[1.0625rem] font-semibold text-accent tabular-nums">
                    {formatPrice(price, currency)}
                  </span>
                )}
              </div>
            </>
          );

          return product.url
            ? (
              <a
                key={i}
                href={product.url}
                class="group flex flex-col no-underline text-base transition-shadow hover:shadow-brand rounded-brand p-2 -m-2"
              >
                {card}
              </a>
            )
            : (
              <div key={i} class="flex flex-col p-2">
                {card}
              </div>
            );
        })}
      </div>
    </div>
  );
}
