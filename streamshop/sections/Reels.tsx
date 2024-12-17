interface Props {
  /**
   * @title Slug da sua loja
   */
  storeSlug?: string;
}

/**
 * @title StreamShop Reels
 */
export default function Stories({ storeSlug = "streamshopdemo" }: Props) {
  return (
    <div
      class="w-screen h-screen bg-black"
      style={{ width: "100vw", height: "100vh" }}
    >
      <iframe
        style="border-radius: 16px; overflow: hidden"
        frameborder="0"
        src={`https://lite.streamshop.com.br/${storeSlug}`}
        height="100%"
        width="100%"
        allow="fullscreen; autoplay; picture-in-picture"
      >
      </iframe>
    </div>
  );
}
