import { AppRuntime } from "deco/types.ts";
import type { App } from "deco/mod.ts";
import type { JSX } from "preact";
import { BaseContext } from "deco/engine/core/resolver.ts";
import Slider from "../components/Slider.tsx";
import { useId as usePreactId, useMemo } from "preact/hooks";
import { Head } from "$fresh/runtime.ts";
import SliderJS from "../components/SliderJS.tsx";

export const useId = () =>
  useMemo(() => `${usePreactId()}${Math.trunc(Math.random() * 1e6)}`, []);

export interface Props {
  publicUrl: string;
}

const DEFAULT_ICON =
  "https://raw.githubusercontent.com/deco-cx/apps/main/decohub/logo.png";

export interface PreviewProps {
  name: string;
  author: string;
  description: string;
  images: string[];
  icon: string;
  pages: Array<{
    title: string;
    content: () => JSX.Element;
  }>;
}

export const Preview = (
  app: AppRuntime<BaseContext, App["state"]> & { config: PreviewProps },
) => {
  const id = useId();
  const name = app.config.name;
  const images = app.config.images;
  const description = app.config.description;
  const author = app.config.author;
  const pages = app.config.pages;
  const icon = app.config.icon;
  const step = 100 / (images.length + 1);

  let tempStep = 0;
  const keyframes = images.map((_, index) => {
    const value1 = `
      ${tempStep + step}% {
        transform: translate3d(calc((${index * 100}% ${
      index > 0 ? "+ 8px" : ""
    }) * -1), 0, 0);
      }`;

    const value2 = `
      ${tempStep + step + 5}% {
        transform: translate3d(calc((${(index + 1) * 100}% + 8px) * -1), 0, 0);
      }`;

    const value = value1 + (index + 1 == images.length ? "" : value2);
    tempStep = tempStep + step + 5;
    return value;
  }).join("");

  return (
    <>
      <Head>
        <link
          href="https://cdn.jsdelivr.net/npm/daisyui@4.10.1/dist/full.min.css"
          rel="stylesheet"
          type="text/css"
        />
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
      </Head>
      <div
        class="h-full flex flex-col gap-4 px-4 relative bg-[#0D1717] text-[#FAFAFA]"
        style={{ minHeight: "100vh" }}
      >
        <div class="flex flex-col md:flex-row gap-4 pt-3">
          <div class="flex flex-col gap-4 w-full md:w-1/2">
            <div class="flex gap-4 items-center ">
              <img
                src={icon ?? DEFAULT_ICON}
                width={60}
                height={60}
                class="aspect-square rounded-lg object-cover"
              />
              <div>
                <h1 class="font-medium text-[32px] leading-10">{name}</h1>
                <span class="text-sm">by {author}</span>
              </div>
            </div>
            <div class="text-[#FAFAFA] ">
              {description}
            </div>
          </div>
          <div class="w-full relative md:w-1/2">
            {images.length > 0 && (
              <div class="w-full" id={id}>
                <div class="w-full mx-auto">
                  <Slider.PrevButton class="disabled:hidden rotate-180 -translate-y-1/2 flex justify-center items-center bg-[#FAFAFA] w-7 h-7 rounded-lg absolute left-7 z-10 top-1/2 shadow-sm">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M5.52864 3.52858C5.78899 3.26823 6.2111 3.26823 6.47145 3.52858L10.4714 7.52858C10.7318 7.78892 10.7318 8.21103 10.4714 8.47138L6.47145 12.4714C6.2111 12.7317 5.78899 12.7317 5.52864 12.4714C5.26829 12.211 5.26829 11.7889 5.52864 11.5286L9.05723 7.99998L5.52864 4.47138C5.26829 4.21103 5.26829 3.78892 5.52864 3.52858Z"
                        fill="#0D1717"
                      />
                    </svg>
                  </Slider.PrevButton>

                  <Slider class="carousel carousel-center gap-2">
                    {images.map((image, index) => (
                      <Slider.Item
                        index={index}
                        class="carousel-item w-full flex items-center justify-center gap-1"
                      >
                        <img
                          src={image}
                          width={434}
                          height={228}
                          class="w-full rounded-lg object-cover h-full"
                        />
                      </Slider.Item>
                    ))}
                  </Slider>
                  <Slider.NextButton class="disabled:hidden bg-[#FAFAFA] -translate-y-1/2 flex justify-center items-center w-7 h-7 rounded-lg absolute right-7 z-10 top-1/2 shadow-sm">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M5.52864 3.52858C5.78899 3.26823 6.2111 3.26823 6.47145 3.52858L10.4714 7.52858C10.7318 7.78892 10.7318 8.21103 10.4714 8.47138L6.47145 12.4714C6.2111 12.7317 5.78899 12.7317 5.52864 12.4714C5.26829 12.211 5.26829 11.7889 5.52864 11.5286L9.05723 7.99998L5.52864 4.47138C5.26829 4.21103 5.26829 3.78892 5.52864 3.52858Z"
                        fill="#0D1717"
                      />
                    </svg>
                  </Slider.NextButton>
                </div>
                <ul class="carousel items-end w-full justify-center col-span-full gap-4 z-10 row-start-4">
                  {images?.map((_, index) => (
                    <li class="carousel-item">
                      <Slider.Dot index={index}>
                        <div class="w-[6px] h-[6px] rounded-full group-disabled:bg-[#FAFAFA] group-disabled:border-[#FAFAFA] bg-[#303D3D] bg-transparent border-[1px] border-[#303D3D]" />
                      </Slider.Dot>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <SliderJS rootId={id} interval={5000} infinite />
        </div>
        <div>
          <div role="tablist" class="tabs tabs-bordered ">
            {pages.map((page, index) => (
              <>
                <input
                  type="radio"
                  name="my_tabs_1"
                  role="tab"
                  class="tab text-[#AFB6B6] checked:text-[#FAFAFA] font-semibold border-white !w-max checked:[--bc:#FAFAFA] [--tab-padding:0] mr-4"
                  aria-label={page.title}
                  checked={index == 0}
                />
                <div role="tabpanel" class="tab-content">
                  <page.content />
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
