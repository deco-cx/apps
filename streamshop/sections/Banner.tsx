import { type HTMLWidget, type ImageWidget } from "../../admin/widgets.ts";
import { Picture, Source } from "../../website/components/Picture.tsx";
import { clx } from "../sdk/clx.ts";
import Section from "../components/ui/StreamshopSection.tsx";

export interface Props {
  /**
   * @title Título
   */
  title?: string;
  /**
   * @title Descrição
   */
  description?: HTMLWidget;

  /**
   * @title Imagens
   */
  images: {
    mobile?: {
      width: number;
      height: number;
      src: ImageWidget;
    };
    desktop?: {
      width: number;
      height: number;
      src: ImageWidget;
    };
  };

  /**
   * @title Botões
   */
  cta?: {
    href: string;
    label: string;
  };
  /**
   * @title Link
   */
  link?: string;

  /**
   * @title Container
   * @description 100% do site ou container
   */
  containerWidth?: "container" | "full";
}

/**
 * @title StreamShop Banner
 */
export default function Banner(
  {
    title = "Title",
    description = "Exemple of description",
    images,
    cta = { href: "/", label: "Click me!" },
    containerWidth,
    link,
  }: Props,
) {
  return (
    <Section.Container
      class={clx(
        containerWidth == "full" && "w-full !max-w-full",
        containerWidth == "container" && "container",
      )}
    >
      <div
        class="relative bg-base-200 mx-5 sm:mx-0"
        hx-on:click={`openStreamShopLive('${link}')`}
      >
        {images?.desktop?.src
          ? (
            <Picture>
              {images?.mobile && (
                <Source
                  media="(max-width: 640px)"
                  src={images.mobile.src}
                  width={images.mobile.width}
                  height={images.mobile?.height}
                />
              )}
              {images?.desktop && (
                <Source
                  media="(min-width: 640px)"
                  src={images.desktop.src}
                  width={images.desktop.width}
                  height={images.desktop.height}
                />
              )}
              <img
                src={images?.desktop?.src}
                alt={title}
                class="w-full object-cover"
              />
            </Picture>
          )
          : (
            <div class="flex max-w-full w-[1320px]  min-h-[448px] bg-slate-400">
            </div>
          )}

        <div
          class={clx(
            "absolute left-0 top-0",
            "p-5 sm:p-10 md:py-20 md:px-[60px]",
            "flex flex-col",
            "h-full max-w-full sm:max-w-[33%] md:max-w-[50%] justify-center",
          )}
        >
          {title && <span class="font-bold text-7xl text-primary">{title}
          </span>}
          {description && (
            <span
              class="font-normal text-sm md: pt-4 pb-12"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
          <div class="">
            {cta && (
              <a
                href={cta.href}
                class="btn btn-primary no-animatio w-fit border-0 min-w-[180px]"
              >
                {cta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </Section.Container>
  );
}

export const LoadingFallback = () => <Section.Placeholder height="635px" />;
