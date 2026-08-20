import Image from "../../../website/components/Image.tsx";
import { getProductDisplay } from "../../utils/productData.ts";
import { coerceProduct } from "../../utils/coerceProductInput.ts";
import { sanitizeHtml } from "../../utils/sanitizeHtml.ts";
import { AppContext } from "../../mod.ts";
import type { Product } from "../../../commerce/types.ts";

/**
 * @title Product
 * @description Search and select a storefront product dynamically.
 * @format dynamic-options
 * @options blog/loaders/options/productsByTerm.ts
 */
type ProductReference = string;

export interface Props {
  /**
   * @title Product
   * @description Product reference as `platform:kind:id` (e.g. `vtex:product:123`). Loader-ref shapes work at runtime but strings are preferred.
   * @format dynamic-options
   * @options blog/loaders/options/productsByTerm.ts
   */
  product?: ProductReference;
  /** Badge text (e.g. "Destaque", "Limited") */
  badge?: string;
  /** Full description (HTML) */
  description?: string;
  /** Call-to-action button text */
  cta?: string;
}

type RuntimeProps = Omit<Props, "product"> & {
  product: Product | null;
};

export async function loader(props: Props, req: Request, ctx: AppContext) {
  const product = await coerceProduct(props.product, req, ctx);
  return {
    badge: props.badge,
    description: props.description,
    cta: props.cta,
    product,
  } as RuntimeProps;
}

/**
 * @title Product Highlight
 * @description Full-width featured product block with image and details side by side.
 */
export default function ProductHighlight(
  { product, badge, description, cta }: RuntimeProps,
) {
  if (!product) return null;

  const {
    name,
    imageUrl,
    width,
    height,
    price,
    listPrice,
    safeUrl,
    isExternal,
  } = getProductDisplay(product);
  if (!name) return null;

  const productDescription = description ?? product.description;

  return (
    <div class="not-prose my-10 border border-line rounded-brand overflow-hidden bg-base">
      <div class="flex flex-col sm:flex-row">
        <div class="relative sm:w-2/5 overflow-hidden bg-alt aspect-video sm:aspect-auto sm:min-h-[280px]">
          <Image
            src={imageUrl}
            alt={name}
            width={width}
            height={height}
            fit="cover"
            loading="lazy"
            fetchPriority="low"
            class="w-full h-full object-cover block"
          />
          {badge && (
            <span class="absolute top-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-inverted leading-none">
              {badge}
            </span>
          )}
        </div>
        <div class="p-7 flex flex-col gap-3 justify-center sm:w-3/5">
          <h3 class="text-xl font-bold leading-snug m-0">{name}</h3>
          {productDescription && (
            <div
              class="text-[0.9375rem] text-secondary leading-relaxed [text-wrap:pretty]"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(productDescription),
              }}
            />
          )}
          <div class="flex items-baseline gap-2.5 mt-1">
            {price && (
              <span class="text-2xl font-bold text-accent tabular-nums">
                {price}
              </span>
            )}
            {listPrice && listPrice !== price && (
              <span class="text-base text-muted line-through tabular-nums">
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
              class="mt-2 self-start inline-flex items-center justify-center py-[0.7em] px-[2em] rounded-full bg-accent text-inverted font-semibold text-sm tracking-[0.02em] no-underline transition-opacity hover:opacity-85"
            >
              {cta ?? "Comprar"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoadingFallback() {
  return (
    <div class="not-prose my-10 border border-line rounded-brand bg-base animate-pulse">
      <div class="flex flex-col sm:flex-row">
        <div class="sm:w-2/5 aspect-video sm:aspect-auto bg-alt" />
        <div class="p-7 sm:w-3/5 flex flex-col gap-3">
          <div class="h-7 bg-alt rounded w-3/4" />
          <div class="h-4 bg-alt rounded" />
          <div class="h-4 bg-alt rounded w-5/6" />
          <div class="h-8 bg-alt rounded w-1/3 mt-2" />
          <div class="h-10 bg-alt rounded-full w-40 mt-2" />
        </div>
      </div>
    </div>
  );
}
