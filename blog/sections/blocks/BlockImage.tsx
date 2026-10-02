export interface Props {
  url: string;
  /** @description Optional mobile-optimized image. Served below 768px. */
  mobileUrl?: string;
  alt?: string;
  caption?: string;
  size?: "full" | "normal";
  /** @description Loads eagerly with high fetch priority. Use for above-the-fold images. */
  highPriority?: boolean;
}

export default function BlockImage(
  { url, mobileUrl, alt, caption, size, highPriority = false }: Props,
) {
  const wrapperClass = size === "full" ? "my-8 -mx-[var(--gutter)]" : "my-8";

  return (
    <figure class={wrapperClass}>
      <div class="overflow-hidden bg-alt">
        <picture>
          {mobileUrl && (
            <source
              media="(max-width: 767px)"
              srcSet={mobileUrl}
            />
          )}
          <img
            src={url}
            alt={alt ?? ""}
            {...(highPriority
              ? { loading: "eager" as const, fetchpriority: "high" }
              : { loading: "lazy" as const, decoding: "async" as const })}
            class="w-full h-auto block"
          />
        </picture>
      </div>
      {caption && (
        <figcaption class="text-sm text-tertiary text-center mt-3 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
