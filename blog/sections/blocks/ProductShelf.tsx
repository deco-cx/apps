import Image from "../../../website/components/Image.tsx";
import { getProductDisplay } from "../../utils/productData.ts";
import {
  getLegacyProductDisplay,
  type LegacyShelfItem,
  parseLegacyShelfItems,
} from "../../utils/legacyProductBlock.ts";
import { resolveProductsByReference } from "../../utils/productResolver.ts";
import { AppContext } from "../../mod.ts";
import type { Product } from "../../../commerce/types.ts";

/**
 * @title Product
 * @description Search and select a storefront product dynamically.
 * @format dynamic-options
 * @options blog/loaders/options/productsByTerm.ts
 */
type ProductReference = string;

type ShelfEntry =
  | { kind: "resolved"; product: Product }
  | {
    kind: "legacy";
    item: LegacyShelfItem;
    display: NonNullable<
      ReturnType<typeof getLegacyProductDisplay>
    >;
  };

export interface Props {
  /** Section title shown above the shelf */
  title?: string;
  /**
   * @title Products
   * @description Product references resolved dynamically from storefront integrations.
   * @format dynamic-options
   * @options blog/loaders/options/productsByTerm.ts
   */
  products?: ProductReference[];
  /**
   * @hide true
   * @deprecated Legacy JSON shelf items. Use `products` instead.
   */
  items?: LegacyShelfItem[] | string;
}

type RuntimeProps = Omit<Props, "products" | "items"> & {
  entries: ShelfEntry[];
};

export async function loader(props: Props, req: Request, ctx: AppContext) {
  const refs = Array.isArray(props.products)
    ? props.products.filter((id) =>
      typeof id === "string" && id.trim().length > 0
    )
    : [];

  if (refs.length > 0) {
    const products = await resolveProductsByReference(refs, req, ctx);
    return {
      title: props.title,
      entries: products.map((product) => ({
        kind: "resolved" as const,
        product,
      })),
    } as RuntimeProps;
  }

  const legacyItems = parseLegacyShelfItems(props.items);
  const entries = legacyItems.flatMap((item) => {
    const display = getLegacyProductDisplay(item);
    return display ? [{ kind: "legacy" as const, item, display }] : [];
  });

  return {
    title: props.title,
    entries,
  } as RuntimeProps;
}

/**
 * @title Product Shelf
 * @description Horizontally scrollable row of product cards.
 */
export default function ProductShelf(
  { title, entries }: RuntimeProps,
) {
  if (!entries?.length) return null;

  return (
    <div class="not-prose my-10">
      {title && (
        <h3 class="text-base font-semibold tracking-tight mb-4 m-0">{title}</h3>
      )}
      <div class="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-line">
        {entries.map((entry, index) => {
          const display = entry.kind === "resolved"
            ? getProductDisplay(entry.product)
            : entry.display;
          const {
            name,
            imageUrl,
            width,
            height,
            price,
            listPrice,
            safeUrl,
            isExternal,
          } = display;
          if (!name) return null;

          const badge = entry.kind === "legacy" ? entry.item.badge : undefined;

          return (
            <div
              key={entry.kind === "resolved"
                ? `${entry.product.productID ?? entry.product.sku ?? index}`
                : `${name}-${index}`}
              class="flex-none w-44 snap-start border border-line rounded-brand overflow-hidden bg-base"
            >
              {imageUrl && (
                <div class="relative overflow-hidden bg-alt aspect-square">
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={Math.min(width, 352)}
                    height={Math.min(height, 352)}
                    fit="cover"
                    loading="lazy"
                    fetchPriority="low"
                    class="w-full h-full object-cover block"
                  />
                  {badge && (
                    <span class="absolute top-2 left-2 text-[0.65rem] font-semibold px-1.5 py-0.5 rounded-full bg-accent text-inverted leading-none">
                      {badge}
                    </span>
                  )}
                </div>
              )}
              <div class="p-3 flex flex-col gap-1">
                <span class="text-sm font-semibold leading-snug line-clamp-2">
                  {name}
                </span>
                <div class="flex items-baseline gap-1 flex-wrap">
                  {price && (
                    <span class="text-sm font-bold text-accent tabular-nums">
                      {price}
                    </span>
                  )}
                  {listPrice && listPrice !== price && (
                    <span class="text-xs text-muted line-through tabular-nums">
                      {listPrice}
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

export function LoadingFallback() {
  return (
    <div class="not-prose my-10 animate-pulse">
      <div class="h-5 bg-alt rounded w-40 mb-4" />
      <div class="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            class="flex-none w-44 border border-line rounded-brand overflow-hidden bg-base"
          >
            <div class="aspect-square bg-alt" />
            <div class="p-3 flex flex-col gap-2">
              <div class="h-4 bg-alt rounded" />
              <div class="h-3 bg-alt rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
