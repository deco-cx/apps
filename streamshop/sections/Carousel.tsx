import { clx } from "../sdk/clx.ts";
import Section, {
  Props as SectionHeaderProps,
} from "../components/ui/StreamshopSection.tsx";
import { type LoadingFallbackProps } from "@deco/deco";
import { useDevice } from "@deco/deco/hooks";

interface StyleDesktop {
  /**
   * @title Altura do vídeo
   * @desription px ou %
   */
  videoHeigth?: string;

  /**
   * @title Largura do vídeo
   * @desription px ou %
   */
  videoWidth?: string;
}

interface StyleMobile {
  /**
   * @title Altura do vídeo
   * @desription px ou %
   */
  videoHeigth?: string;

  /**
   * @title Largura do vídeo
   * @desription px ou %
   */
  videoWidth?: string;
}

interface Style {
  /**
   * @title Container
   * @description 100% do site ou container
   */
  containerWidth?: "container" | "full";

  /**
   * @title Arredondamento dos cantos
   */
  radius?: "pequeno" | "médio" | "grande" | "pílula";

  /**
   * @title Desktop
   */
  styleDesktop?: StyleDesktop;

  /**
   * @title Mobile
   */
  styleMobile?: StyleMobile;
}

interface Props extends SectionHeaderProps {
  /**
   * @title Slug dos videos
   */
  slugs: string[];

  /**
   * @title Estilo
   */
  style: Style;
}

/**
 * @title StreamShop Carousel Video
 */
export default function Carousel({
  title = "Title",
  cta,
  slugs = [
    "lnSWxBFj",
    "E5hUMpXl",
    "o8GbO1r7",
    "g31wys57",
    "4J8mqGAD",
    "Q41wyj80",
    "NJ6WxSZp",
    "lCx1dr89",
    "ZI2NBKS7",
    "ximkLtuV",
    "AG6Fhvn0",
    "YLohX8FM",
    "lUwLnDpx",
    "5ur2WIIU",
    "PdfbAvpP",
  ],
  style = {
    styleDesktop: {
      videoWidth: "300px",
      videoHeigth: "500px",
    },
  },
}: Props) {
  const device = useDevice();
  const currentStyle = device == "desktop"
    ? style.styleDesktop
    : style.styleMobile;
  return (
    <>
      <script
        async
        src="https://assets.streamshop.com.br/sdk-ads/liveshop-ads-video.min.js"
      >
      </script>
      <script
        async
        src="https://assets.streamshop.com.br/sdk-ads/liveshop-ads-carousel.min.js"
      >
      </script>
      <Section.Container
        class={clx(
          style?.containerWidth == "full" && "w-full !max-w-full",
          style?.containerWidth == "container" && "container",
        )}
      >
        <div
          class={clx(
            style?.containerWidth == "full" && "sm:!px-5",
          )}
        >
          <Section.Header title={title} cta={cta} />
        </div>

        <div style="width: 100%;" class="w-full px-5 sm:px-0">
          {/* @ts-ignore */}
          <liveshop-ads-carousel
            videos-width={currentStyle?.videoWidth}
            height={currentStyle?.videoHeigth}
            border-radius={style?.radius == "pequeno"
              ? "4px"
              : style?.radius == "médio"
              ? "10px"
              : style?.radius == "grande"
              ? "20px"
              : style?.radius == "pílula"
              ? "500px"
              : "5px"}
            slugs-video={`${slugs.join(",")}`}
          >
            {/* @ts-ignore */}
          </liveshop-ads-carousel>
        </div>
      </Section.Container>
    </>
  );
}

export const LoadingFallback = (
  { title, cta }: LoadingFallbackProps<Props>,
) => (
  <Section.Container>
    <Section.Header title={title} cta={cta} />
    <Section.Placeholder height="471px" />;
  </Section.Container>
);
