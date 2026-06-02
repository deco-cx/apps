import { sanitizeHref, sanitizeHtml } from "../../utils/sanitizeHtml.ts";

export interface Props {
  /** Product name */
  name: string;
  /** Current price (formatted string) */
  price?: string;
  /** List/original price */
  listPrice?: string;
  /** Product image URL */
  imageUrl?: string;
  /** Product page URL */
  url?: string;
  /** Badge text (e.g. "Destaque", "Limited") */
  badge?: string;
  /** Full description (HTML) */
  description?: string;
  /** Call-to-action button text */
  cta?: string;
}

/**
 * @title Product Highlight
 * @description Full-width featured product block with image and details side by side.
 */
export default function ProductHighlight(
  { name, price, listPrice, imageUrl, url, badge, description, cta }: Props,
) {
  const safeUrl = sanitizeHref(url);
  const isExternal = /^https?:\/\//i.test(safeUrl);

  return (
    <div class="not-prose my-10 border border-line rounded-brand overflow-hidden bg-base">
      <div class="flex flex-col sm:flex-row">
        {imageUrl && (
          <div class="relative sm:w-2/5 overflow-hidden bg-alt aspect-video sm:aspect-auto">
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              class="w-full h-full object-cover block"
            />
            {badge && (
              <span class="absolute top-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-inverted leading-none">
                {badge}
              </span>
            )}
          </div>
        )}
        <div
          class={`p-7 flex flex-col gap-3 justify-center ${
            imageUrl ? "sm:w-3/5" : "w-full"
          }`}
        >
          <h3 class="text-xl font-bold leading-snug m-0">{name}</h3>
          {description && (
            <div
              class="text-[0.9375rem] text-secondary leading-relaxed [text-wrap:pretty]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
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
