import { sanitizeHref, sanitizeHtml } from "../../utils/sanitizeHtml.ts";

export interface Props {
  /** Product name */
  name: string;
  /** Current price (formatted string, e.g. "R$ 49,90") */
  price?: string;
  /** List/original price */
  listPrice?: string;
  /** Primary image URL */
  imageUrl?: string;
  /** Product page URL */
  url?: string;
  /** Badge text (e.g. "New", "Sale") */
  badge?: string;
  /** Short description (HTML) */
  description?: string;
  /** Call-to-action button text */
  cta?: string;
}

/**
 * @title Product Card
 * @description Displays a shoppable product card with image, name, price and CTA.
 */
export default function ProductCard(
  { name, price, listPrice, imageUrl, url, badge, description, cta }: Props,
) {
  const safeUrl = sanitizeHref(url);
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
        {description && (
          <div
            class="text-sm text-secondary leading-normal [text-wrap:pretty] line-clamp-3"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
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
