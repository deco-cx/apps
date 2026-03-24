export interface Props {
  url: string;
  caption?: string;
}

export default function Video({ url, caption }: Props) {
  let src = url ?? "";

  const ytMatch = src.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) src = `https://www.youtube.com/embed/${ytMatch[1]}`;

  const vimeoMatch = src.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) src = `https://player.vimeo.com/video/${vimeoMatch[1]}`;

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
