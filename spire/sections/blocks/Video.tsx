export interface Props {
  url: string;
  caption?: string;
}

function resolveEmbedSrc(raw: string): string | null {
  const ytMatch = raw.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  const vimeoMatch = raw.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Reject anything that didn't match a trusted provider.
  return null;
}

export default function Video({ url, caption }: Props) {
  const src = resolveEmbedSrc(url ?? "");

  if (!src) return null;

  return (
    <figure class="my-8">
      <div class="relative aspect-video overflow-hidden bg-alt">
        <iframe
          src={src}
          class="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={caption ?? "Video"}
        />
      </div>
      {caption && (
        <figcaption class="text-sm text-tertiary text-center mt-3 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
