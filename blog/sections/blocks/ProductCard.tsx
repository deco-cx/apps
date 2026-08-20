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
  /** Badge text (e.g. "New", "Sale") */
  badge?: string;
  /** Short description (HTML) */
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
 * @title Product Card
 * @description Displays a shoppable product card with image, name, price and CTA.
 */
export default function ProductCard(
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
    <div class="not-prose my-8 border border-line rounded-brand overflow-hidden bg-base max-w-xs mx-auto">
      <div class="relative overflow-hidden bg-alt aspect-square">
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
          <span class="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full bg-accent text-inverted leading-none">
            {badge}
          </span>
        )}
      </div>
      <div class="p-5 flex flex-col gap-2">
        <h3 class="text-[1.0625rem] font-semibold leading-snug m-0">{name}</h3>
        {productDescription && (
          <div
            class="text-sm text-secondary leading-normal [text-wrap:pretty] line-clamp-3"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(productDescription),
            }}
          />
        )}
        <div class="mt-1 flex items-baseline gap-2">
          {price && (
            <span class="text-lg font-bold text-accent tabular-nums">
              {price}
            </span>
          )}
          {listPrice && listPrice !== price && (
            <span class="text-sm text-muted line-through tabular-nums">
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
            class="mt-2 inline-flex items-center justify-center py-[0.6em] px-[1.5em] rounded-full bg-accent text-inverted font-semibold text-sm tracking-[0.02em] no-underline transition-opacity hover:opacity-85"
          >
            {cta ?? "Comprar"}
          </a>
        )}
      </div>
    </div>
  );
}

export function LoadingFallback() {
  return (
    <div class="not-prose my-8 border border-line rounded-brand bg-base max-w-xs mx-auto p-5 animate-pulse">
      <div class="aspect-square bg-alt mb-4 rounded-brand" />
      <div class="h-5 bg-alt mb-2 rounded" />
      <div class="h-4 bg-alt mb-2 rounded" />
      <div class="h-4 bg-alt w-2/3 mb-4 rounded" />
      <div class="h-9 bg-alt w-1/2 rounded-full" />
    </div>
  );
}
