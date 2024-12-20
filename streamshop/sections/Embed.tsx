interface Props {
  /**
   * @title Slugs á serem exibidos
   */
  slugs?: string[];
}

/**
 * @title StreamShop Embed
 */
export default function Stories(
  { slugs = ["YW9HwZbU", "hOok12Xu", "9zCcxtSH", "CS2UU3tJ"] }: Props,
) {
  return (
    <div class="w-screen h-auto py-24 max-w-full flex items-center justify-center">
      <iframe
        style="border-radius: 16px; overflow: hidden"
        frameborder="0"
        src={`https://lite.streamshop.com.br/videos/${slugs.join(",")}`}
        height="640"
        width="1080"
        allow="fullscreen; autoplay; picture-in-picture"
      >
      </iframe>
    </div>
  );
}
