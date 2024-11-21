import { ComponentChildren } from "preact";
import { useId } from "preact/hooks";
import HTMXSection from "apps/htmx/sections/htmx.tsx";
import Slider from "../../../utils/components/Slider";
import SliderJS from "../../../utils/components/SliderJS";

interface Props {
  name: string;
  owner: string;
  description: string;
  logo: string;
  images: string[];
  tabs?: {
    title: string;
    content: ComponentChildren;
  }[];
}

export function PreviewContainer(props: Props) {
  const { name, owner, description, logo, images, tabs } = props;
  const id = "app-carousel-" + useId();
  return (
    <div class="w-full h-auto bg-black">
      <HTMXSection
        version="1.9.11"
        cdn="https://cdn.jsdelivr.net/npm"
        extensions={[]}
      />
      <link
        href="https://cdn.jsdelivr.net/npm/daisyui@4.10.1/dist/full.min.css"
        rel="stylesheet"
        type="text/css"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
                    html {
                    height: 100%;
                    font-family: sans-serif;
                    }
                    body {
                    height: 100%;
                    }
                    .rm-marker {
                      list-style: none !important;
                    }
                    .rm-marker::-webkit-details-marker {
                      display: none ;
                    }
                `,
        }}
      >
      </style>
      <div class="flex flex-col">
        {/* Carousel */}
        <div style="width: 100%;" class="w-full px-5 pt-5 sm:px-0">
          {/* @ts-ignore */}
          <liveshop-ads-carousel
            videos-width="100%"
            height="400px"
            slugs-video={"y7CsjIQW,hgkY4Jep,zaz69CFN,5BIW6TxE"}
          >
            {/* @ts-ignore */}
          </liveshop-ads-carousel>
        </div>

        {/*  */}
        <div class="container flex flex-col gap-8 p-8">
          <div class="w-full sm:w-1/2">
            <div class="flex flex-col gap-8">
              <div class="flex gap-4">
                <img
                  src={logo}
                  width="110"
                  height="110"
                  class="rounded-2xl max-h-[110px]"
                />
                <div class="flex flex-col justify-center gap-4">
                  <h1 class="text-white text-2xl font-bold text-[48px]">
                    {name}
                  </h1>
                  <p class="text-white text-[24px] font-light">by {owner}</p>
                </div>
              </div>
              <p class="text-white text-[12px] sm:text-[20px] font-light leading-[16px] sm:leading-[28px]">
                {description}
              </p>
            </div>
          </div>
          {images.length > 0 && (
            <div class="flex flex-col gap-6 w-full" id={id}>
              <div class="flex">
                {images.length > 1 && (
                  <div class="relative">
                    <Slider.PrevButton class="disabled:hidden rotate-180 -translate-y-1/2 flex justify-center items-center bg-[#0D1717] w-12 h-12 rounded-lg absolute left-4 z-10 top-1/2 shadow-sm">
                      <ArrowSvg />
                    </Slider.PrevButton>
                  </div>
                )}
                <Slider class="carousel carousel-center gap-2">
                  {images.map((image, index) => {
                    return (
                      <Slider.Item
                        index={index}
                        class="carousel-item w-full flex items-center justify-center gap-1"
                      >
                        <img
                          src={image}
                          width="1180"
                          height="660"
                          class="rounded-2xl w-full h-full object-cover"
                        />
                      </Slider.Item>
                    );
                  })}
                </Slider>
                {images.length > 1 && (
                  <div class="relative">
                    <Slider.NextButton class="disabled:hidden bg-[#0D1717] -translate-y-1/2 flex justify-center items-center w-12 h-12 rounded-lg absolute right-4 z-10 top-1/2 shadow-sm">
                      <ArrowSvg />
                    </Slider.NextButton>
                  </div>
                )}
              </div>
              <ul class="carousel items-end w-full justify-center col-span-full gap-4 z-10 row-start-4">
                {images.length > 1 &&
                  images?.map((_, index) => (
                    <li class="carousel-item">
                      <Slider.Dot index={index}>
                        <div class="w-[10px] h-[10px] rounded-full group-disabled:bg-[#0D1717]  bg-[#C9CFCF]" />
                      </Slider.Dot>
                    </li>
                  ))}
              </ul>
              <SliderJS rootId={id} interval={5000} infinite />
            </div>
          )}
        </div>
        {/* Stories */}
        {/* @ts-ignore */}
        <div
          id="3957755711-00"
          data-manifest-key="streamshop-app/sections/Stories.tsx"
        >
          <div class="container flex flex-col gap-4 sm:gap-6 w-full py-5 sm:py-10">
            <div class="flex justify-between items-center gap-2 px-5 sm:px-0">
              <span class="text-white text-2xl sm:text-3xl font-semibold">
                Stories
              </span>
            </div>
            <div
              style="width: 100%; height: 100px;"
              class="w-full px-5 sm:px-0"
            >
              <liveshop-ads-carousel
                videos-width="80px"
                height="80px"
                border-radius="50%"
                gap="25px"
                slugs-video="dBXLVDZM,B9hKEmHZ,2FMdPkiN,sBLteawk,DfnZOD3J,dBXLVDZM,B9hKEmHZ,2FMdPkiN,sBLteawk,DfnZOD3J,dBXLVDZM,B9hKEmHZ,2FMdPkiN,sBLteawk,DfnZOD3J"
              >
              </liveshop-ads-carousel>
            </div>
          </div>
        </div>
        <div class="flex gap-8 m-8 px-8 relative">
          {tabs?.map((tab, idx) => {
            return (
              <details class="group tab-details" open={idx === 0}>
                <summary class="cursor-pointer rm-marker uppercase py-2 group-open:border-b-[4px] group-open:border-black group-open:font-semibold">
                  {tab.title}
                </summary>
                <div class="absolute left-0 top-[70px]">
                  {tab.content}
                </div>
              </details>
            );
          })}
          {(tabs?.length || 0) > 0 && (
            <div class="absolute w-full h-[3px] bg-[#C9CFCF] left-0 z-[-2] top-[41px]">
            </div>
          )}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // script to close all details when click on one
                document.querySelectorAll('.tab-details>summary').forEach((summary)=>{
                  summary.onclick = (e)=>{
                    e.preventDefault();
                    const details = document.querySelectorAll('.tab-details')
                        details.forEach((detail) => {
                        detail.removeAttribute('open')
                    });
                    event.currentTarget.parentElement.setAttribute('open', '')
                  }
                })
              `,
            }}
          >
          </script>
        </div>

        

        {
          /* Reels e Info
          */
        }
        <div
          id="3434522839-00"
          data-manifest-key="streamshop-app/sections/Info&amp;Reels.tsx"
        >
          <div class="container flex flex-col gap-4 sm:gap-6 w-full py-5 sm:py-10">
            <div class="w-full flex justify-between items-start flex-col sm:flex-row gap-4 !px-5 md:!px-0">
              <div class="w-full">
                <div class="text-white lynx-subtitle">
                Video Commerce StreamShop
                </div>
                <h2 class="lynx-heading !text-white">
                  <span
                    style="font-size: 24pt;"
                    data-mce-style="font-size: 24pt;"
                  >
                    Incorpore Reels interativos no seu ecommerce ou distribua por whatsapp 🚀
                  </span>
                </h2>
                <p class="lynx-paragraph !text-white">
                  <strong>
                    <span
                      style="font-size: 18pt;color: white"
                      data-mce-style="font-size: 18pt;"
                    >
                      O Video Commerce da StreamShop é uma solução inovadora de simples implementação que eleva a experiência dos seus clientes com a sua marca.

Incorpore os vídeos que você já produz para as redes sociais às páginas do seu site ou distribua por whatsapp, oferecendo muito mais conteúdo e interatividade para seus consumidores.
                    </span>
                    <br />‍
                  </strong>
                  <br />
                  <span
                    style="font-size: 14pt;color: white"
                    data-mce-style="font-size: 14pt;"
                  >
                    Eleve a conversão de suas vendas. Abra a sua conta!
                  </span>
                  <br />
                  <br />
                  <br />‍
                  <br />
                  <span
                    style="font-size: 14pt;color: white"
                    data-mce-style="font-size: 14pt;"
                  >
                    <strong>Clique nos videos e experimente!</strong>
                  </span>
                </p>
              </div>
              <div
                style="width: 100%"
                class="w-full px-5 sm:px-0 flex justify-center items-center"
              >
                <iframe
                  style="border-radius: 16px; overflow: hidden"
                  frameborder="0"
                  src="https://lite.streamshop.com.br/streamshopdemo"
                  height="400px"
                  width="100%"
                  allow="fullscreen; autoplay; picture-in-picture"
                  class="max-w-[380px] md:max-w-[440px] aspect-[9/16]"
                >
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script src="https://unpkg.com/windicss-runtime-dom"></script>
    </div>
  );
}

const ArrowSvg = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M5.52864 3.52858C5.78899 3.26823 6.2111 3.26823 6.47145 3.52858L10.4714 7.52858C10.7318 7.78892 10.7318 8.21103 10.4714 8.47138L6.47145 12.4714C6.2111 12.7317 5.78899 12.7317 5.52864 12.4714C5.26829 12.211 5.26829 11.7889 5.52864 11.5286L9.05723 7.99998L5.52864 4.47138C5.26829 4.21103 5.26829 3.78892 5.52864 3.52858Z"
      fill="#FFFFFF"
    />
  </svg>
);
