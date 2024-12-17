import { ComponentChildren } from "preact";
import { useId } from "preact/hooks";
import HTMXSection from "../../../htmx/sections/htmx.tsx";

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
        <div
          style="width: 100%;"
          class="w-full px-5 pt-5 sm:px-0 flex items-center justify-center"
        >
          <iframe
            style="border-radius: 16px; overflow: hidden"
            frameborder="0"
            src="https://lite.streamshop.com.br/videos/YW9HwZbU,hOok12Xu,9zCcxtSH,CS2UU3tJ"
            height="640"
            width="1080"
            allow="fullscreen; autoplay; picture-in-picture"
          >
          </iframe>
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
                <ul class="carousel carousel-center gap-2 flex">
                  {images.map((image, index) => {
                    return (
                      <div
                        key={index}
                        class="carousel-item w-full flex items-center justify-center gap-1"
                      >
                        <img
                          src={image}
                          width="1180"
                          height="660"
                          class="rounded-2xl w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </ul>
              </div>
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
              {/* @ts-expect-error element added via script */}
              <liveshop-ads-carousel
                videos-width="80px"
                height="80px"
                border-radius="50%"
                gap="25px"
                slugs-video="MMcAo2T,XVIsYAtf,3CmDPspJ,tWt0D0uj,f6RBZxbv,ZEE475P0,cMuOWvSY,7zFgxuWN,ngeDUus8,6s4UeqGx,cYRz77Iq,6SAl8AeO,4aMF9tRs,wLVxzDYe,TC8ns1RE,VnpZF5Rn,s7QFXi2S,ER5Io3H4,iC7cmu2g,qT0Vydla,TTzeJvYv,TTzeJvYv,R1Yf913S,i8QFKUqA,JPAVHsLx,0pyHCynl,Rm7y6eVs,YW9HwZbU,InvkiyUq,hOok12Xu,CS2UU3tJ,knPoh3sQ,v4Jt9MLI,2sX96JB5,Tgc7HJVk,PFhMtOni,vvtui7Q7,BFs9VOoA"
              >
                {/* @ts-expect-error element added via script */}
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
          <div class="container flex flex-col gap-4 sm:gap-6 w-full py-5 sm:py-10 sm:px-5">
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
                    Incorpore Reels interativos no seu ecommerce ou distribua
                    por whatsapp 🚀
                  </span>
                </h2>
                <p class="lynx-paragraph !text-white mt-5">
                  <strong>
                    <span
                      style="font-size: 16pt;font-weight:500; color: white"
                      data-mce-style="font-size: 16pt;"
                    >
                      O Video Commerce da StreamShop é uma solução inovadora de
                      simples implementação que eleva a experiência dos seus
                      clientes com a sua marca.

                      Incorpore os vídeos que você já produz para as redes
                      sociais às páginas do seu site ou distribua por whatsapp,
                      oferecendo muito mais conteúdo e interatividade para seus
                      consumidores.
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
                  style="border-radius: 16px; overflow: hidden; aspect-ratio: 9 / 16;"
                  frameborder="0"
                  src="https://lite.streamshop.com.br/streamshopdemo"
                  height="500px"
                  width="auto"
                  allow="fullscreen; autoplay; picture-in-picture"
                  class="max-h-[300px] md:max-h-[500px] aspect-[9/15]"
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
