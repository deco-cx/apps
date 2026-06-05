import { sanitizeHref, sanitizeHtml } from "../../utils/sanitizeHtml.ts";
import { getProductImage, getProductPrices } from "../../utils/productData.ts";
import { resolveProductByReference } from "../../core/productResolver.ts";
import { AppContext } from "../../mod.ts";
import { Product } from "../../../commerce/types.ts";

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
   * @description Product reference resolved dynamically from storefront integrations.
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
  const product = await resolveProductByReference(props.product, req, ctx);
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

  const name = product.name ?? "";
  if (!name) return null;

  const imageUrl = getProductImage(product);
  const { price, listPrice } = getProductPrices(product);
  const productDescription = description ?? product.description;
  const safeUrl = sanitizeHref(product.url);

  const isExternal = /^https?:\/\//i.test(safeUrl);

  return (
    <div class="not-prose my-8 border border-line rounded-brand overflow-hidden bg-base max-w-xs mx-auto">
      {imageUrl && (
        <div class="relative overflow-hidden bg-alt aspect-square">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            class="w-full h-full object-cover block"
          />
          {badge && (
            <span class="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full bg-accent text-inverted leading-none">
              {badge}
            </span>
          )}
        </div>
      )}
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
