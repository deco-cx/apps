import { AppRuntime } from "deco/types.ts";
import { AppType } from "../mod.ts";
import type { JSX } from "preact";
import { Context } from "deco/live.ts";
import { BaseContext } from "deco/engine/core/resolver.ts";

export interface Props {
  publicUrl: string;
}

export const PreviewMagento = (
  app: AppRuntime<BaseContext, AppType["state"]> & {
    markdownContent: () => JSX.Element;
  },
) => {
  const context = Context.active();
  const decoSite = context.site;
  return (
    <div class="h-full px-4 relative">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            a{
              color: #111827;
              font-weight: 600;
              text-decoration: underline;
            }
            #tab[open]>summary{
              font-weight: 700;
            }
          `,
        }}
      >
      </style>
      <div>
        <a
          href="https://business.adobe.com/br/products/magento/magento-commerce.html"
          class="flex justify-center py-4"
        >
          <MagentoSvg />
        </a>
      </div>
      <div class="flex justify-center relative gap-8">
        <details open id="tab" class="group text-black">
          <summary class="w-auto text-left text-2xl cursor-pointer py-4 group-open:font-semibold">
            General Information
          </summary>
          <div
            class="absolute top-[70px] w-full left-0 bg-white rounded-lg p-4"
            style={{
              boxShadow: "0px 0px 5px 3px rgba(0,0,0,0.20)",
            }}
          >
            {app.markdownContent && <app.markdownContent />}
          </div>
        </details>
        <details id="tab" class="group text-black">
          <summary class="w-auto text-lef text-2xl cursor-pointer py-4 group-open:font-semibold">
            Go Live (pt-BR)
          </summary>
          <ul
            class="absolute top-[70px] w-full left-0 bg-white rounded-lg p-4"
            style={{
              boxShadow: "0px 0px 5px 3px rgba(0,0,0,0.20)",
            }}
          >
            <GoLivePtBr decoSite={decoSite} />
          </ul>
        </details>
        <details id="tab" class="group text-black">
          <summary class="w-auto text-lef text-2xl cursor-pointer py-4 group-open:font-semibold">
            Go Live (en-US)
          </summary>
          <ul
            class="absolute top-[70px] w-full left-0 bg-white rounded-lg p-4"
            style={{
              boxShadow: "0px 0px 5px 3px rgba(0,0,0,0.20)",
            }}
          >
            <GoLiveEnUs decoSite={decoSite} />
          </ul>
        </details>
        <details id="tab" class="group text-black">
          <summary class="w-auto text-lef text-2xl cursor-pointer py-4 group-open:font-semibold">
            Webhooks
          </summary>
          <ul
            class="absolute top-[70px] w-full left-0 bg-white rounded-lg p-4"
            style={{
              boxShadow: "0px 0px 5px 3px rgba(0,0,0,0.20)",
            }}
          >
            <Webhooks />
          </ul>
        </details>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // script to close all details when click on one
            document.querySelectorAll('#tab>summary').forEach((summary)=>{
              summary.onclick = (e)=>{
                const details = summary.parentElement
                const open = details.open
                document.querySelectorAll('#tab').forEach((d)=>{ d.open = false });
              }
            })
          `,
          }}
        >
        </script>
        <script src="https://unpkg.com/windicss-runtime-dom"></script>
      </div>
    </div>
  );
};

function MagentoSvg() {
  return (
    <svg
      id="Logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 110.458"
      width="400"
      height="110.458"
    >
      <title>magento-logo</title>
      <g>
        <path
          points="396.9 0 0 229.1 0 686.7 113.3 752.2 112.5 294.5 396.1 130.8 679.7 294.5 679.7 752 793 686.7 793 228.7 396.9 0"
          fill="#f26322"
          d="M47.877 0 0 27.636V82.835l13.667 7.901 -0.097 -55.211 34.21 -19.747 34.21 19.747v55.187l13.667 -7.877V27.587z"
        />
        <path
          points="453.1 752.1 396.5 785 339.6 752.4 339.6 294.5 226.4 359.9 226.6 817.6 396.4 915.7 566.4 817.6 566.4 359.9 453.1 294.5 453.1 752.1"
          fill="#f26322"
          d="m54.656 90.724 -6.827 3.969 -6.864 -3.933V35.525l-13.655 7.889 0.024 55.211 20.482 11.834 20.507 -11.834V43.414l-13.667 -7.889z"
        />
        <path
          d="m126.96 27.973 18.794 47.479h0.157L164.246 27.973h7.153v54.403h-4.946V34.97h-0.157q-0.386 1.291 -0.832 2.581 -0.386 1.062 -0.881 2.352c-0.326 0.869 -0.627 1.677 -0.869 2.437l-15.754 40.036h-4.487l-15.911 -40.024q-0.458 -1.062 -0.917 -2.316t-0.844 -2.401q-0.458 -1.375 -0.917 -2.666h-0.157v47.406h-4.693V27.974z"
          fill="#4d4d4d"
        />
        <path
          d="M185.778 82.606a11.573 11.573 0 0 1 -4.065 -2.051 9.653 9.653 0 0 1 -2.702 -3.426q-0.989 -2.051 -0.989 -4.789 0 -3.498 1.291 -5.706a9.989 9.989 0 0 1 3.498 -3.534q2.207 -1.327 5.139 -2.014a54.933 54.933 0 0 1 6.273 -1.062q2.895 -0.302 4.91 -0.651t3.269 -0.881 1.822 -1.411 0.567 -2.401v-0.76q0 -4.029 -2.437 -5.971t-6.996 -1.942q-10.507 0 -11.037 8.758h-4.644q0.386 -5.706 4.222 -9.131t11.447 -3.426q6.466 0 10.193 2.859t3.727 9.325v21.375q0 1.749 0.651 2.545t1.942 0.881a4.533 4.533 0 0 0 0.796 -0.072c0.277 -0.048 0.591 -0.133 0.953 -0.229h0.229v3.426a8.933 8.933 0 0 1 -1.291 0.422 8.053 8.053 0 0 1 -1.906 0.193q-2.581 0 -4.113 -1.339t-1.677 -4.222v-0.832h-0.205a22.933 22.933 0 0 1 -2.014 2.364 13.6 13.6 0 0 1 -2.859 2.207 15.973 15.973 0 0 1 -3.884 1.592q-2.207 0.615 -5.018 0.603a18.24 18.24 0 0 1 -5.102 -0.687m11.604 -4.15q2.473 -1.025 4.15 -2.63a10.651 10.651 0 0 0 3.353 -7.684v-7.081q-1.906 1.062 -4.608 1.641t-5.597 0.953q-2.509 0.386 -4.644 0.796t-3.691 1.327a6.816 6.816 0 0 0 -2.473 2.473q-0.917 1.556 -0.917 4.077 0 2.051 0.724 3.426a6.213 6.213 0 0 0 1.906 2.207 7.467 7.467 0 0 0 2.774 1.182 15.947 15.947 0 0 0 3.353 0.338q3.197 0 5.67 -1.025"
          fill="#4d4d4d"
        />
        <path
          d="M221.918 93.233q-3.957 -2.931 -4.487 -7.346h4.56q0.615 3.426 3.691 4.91t7.346 1.484q6.321 0 9.325 -3.004t3.004 -8.263v-6.237h-0.229q-2.207 3.341 -5.102 5.09t-7.382 1.749q-3.884 0 -6.996 -1.447a15.467 15.467 0 0 1 -5.332 -4.029q-2.207 -2.581 -3.39 -6.2t-1.182 -7.949q0 -4.789 1.363 -8.48t3.655 -6.2a15.067 15.067 0 0 1 5.368 -3.8 16.64 16.64 0 0 1 6.502 -1.291q4.56 0 7.527 1.87t4.946 5.054h0.229v-6.104h4.668v37.817q0 6.538 -3.655 10.579 -4.487 4.717 -13.161 4.717 -7.31 0 -11.267 -2.931m20.627 -19.903q3.124 -4.343 3.124 -11.411 0 -3.498 -0.76 -6.393t-2.364 -4.982a10.8 10.8 0 0 0 -3.993 -3.233q-2.401 -1.146 -5.597 -1.146 -5.862 0 -9.095 4.33t-3.233 11.568a24.08 24.08 0 0 0 0.76 6.2q0.76 2.847 2.28 4.946a10.747 10.747 0 0 0 3.8 3.269q2.28 1.182 5.404 1.182 6.538 0 9.662 -4.343"
          fill="#4d4d4d"
        />
        <path
          d="M266.357 81.809a16.053 16.053 0 0 1 -5.742 -4.33q-2.316 -2.774 -3.534 -6.55t-1.218 -8.178q0 -4.415 1.291 -8.178t3.607 -6.538a16.32 16.32 0 0 1 5.633 -4.343q3.305 -1.556 7.419 -1.556 4.717 0 7.949 1.785a14.899 14.899 0 0 1 5.247 4.789q2.014 3.004 2.859 6.888a37.76 37.76 0 0 1 0.832 7.986h-29.976a22.8 22.8 0 0 0 0.953 6.2 15.573 15.573 0 0 0 2.509 4.982 11.4 11.4 0 0 0 4.15 3.353q2.509 1.218 5.862 1.218 4.946 0 7.648 -2.401t3.836 -6.429h4.572q-1.291 5.862 -5.332 9.361t-10.724 3.498q-4.415 0 -7.841 -1.556m18.565 -27.395q-0.76 -2.545 -2.207 -4.415a10.096 10.096 0 0 0 -3.655 -2.931q-2.207 -1.062 -5.247 -1.062t-5.295 1.062a11.307 11.307 0 0 0 -3.92 2.931 14.613 14.613 0 0 0 -2.545 4.379 21.6 21.6 0 0 0 -1.254 5.477h24.958a20.8 20.8 0 0 0 -0.832 -5.44"
          fill="#4d4d4d"
        />
        <path
          d="M301.279 43.04v6.007h0.157a16.16 16.16 0 0 1 5.211 -4.91q3.233 -1.942 7.949 -1.942 5.477 0 9.023 3.161t3.534 9.095v27.938h-4.717V54.91q0 -4.487 -2.401 -6.586t-6.586 -2.087a13.173 13.173 0 0 0 -4.717 0.844 12.427 12.427 0 0 0 -3.884 2.316 10.667 10.667 0 0 0 -2.63 3.534 10.533 10.533 0 0 0 -0.953 4.487v24.97h-4.705V43.04z"
          fill="#4d4d4d"
        />
        <path
          d="M339.325 81.049q-2.051 -1.641 -2.051 -5.44V46.924h-5.935v-3.884h5.935v-12.099h4.717v12.099h7.31v3.884h-7.31v27.925q0 2.135 0.953 2.931t2.847 0.796a8.08 8.08 0 0 0 1.713 -0.193 7.84 7.84 0 0 0 1.411 -0.422h0.229v4.029a13.2 13.2 0 0 1 -4.343 0.687q-3.426 0 -5.477 -1.641"
          fill="#4d4d4d"
        />
        <path
          d="M363.257 81.809a16.48 16.48 0 0 1 -5.742 -4.343q-2.364 -2.774 -3.619 -6.538t-1.254 -8.178 1.254 -8.178 3.619 -6.55a16.507 16.507 0 0 1 5.742 -4.343q3.39 -1.556 7.648 -1.556t7.611 1.556a16.597 16.597 0 0 1 5.706 4.343q2.364 2.774 3.571 6.55t1.218 8.178q0 4.415 -1.218 8.178t-3.571 6.538a16.573 16.573 0 0 1 -5.706 4.343q-3.341 1.556 -7.611 1.556t-7.648 -1.556m13.438 -3.691a11.867 11.867 0 0 0 4.186 -3.571q1.677 -2.28 2.509 -5.332a25.368 25.368 0 0 0 0 -12.931q-0.832 -3.052 -2.509 -5.332a11.813 11.813 0 0 0 -4.186 -3.571q-2.509 -1.303 -5.778 -1.291t-5.826 1.291a12.293 12.293 0 0 0 -4.186 3.571q-1.713 2.28 -2.545 5.332a25.429 25.429 0 0 0 0 12.931q0.832 3.04 2.545 5.332a12.347 12.347 0 0 0 4.186 3.571q2.473 1.291 5.826 1.291t5.778 -1.291"
          fill="#4d4d4d"
        />
        <path
          d="M395.042 49.578c-2.919 0 -4.946 -2.027 -4.946 -5.054s2.075 -5.078 4.946 -5.078 4.958 2.051 4.958 5.078 -2.075 5.054 -4.958 5.054m0 -9.554c-2.352 0 -4.234 1.617 -4.234 4.487s1.87 4.463 4.234 4.463 4.258 -1.617 4.258 -4.463 -1.894 -4.487 -4.258 -4.487m1.459 7.201 -1.677 -2.401h-0.543v2.316h-0.965v-5.621h1.701c1.17 0 1.954 0.591 1.954 1.641 0 0.808 -0.434 1.327 -1.134 1.544l1.617 2.292Zm-1.472 -4.813h-0.748v1.653h0.7c0.627 0 1.025 -0.265 1.025 -0.832s-0.35 -0.832 -0.977 -0.832"
          fill="#4d4d4d"
        />
      </g>
    </svg>
  );
}

function GoLivePtBr({ decoSite }: { decoSite: string }) {
  return (
    <>
      <h2 class="text-2xl font-semibold">
        Preparativos
        <span class="text-xs font-normal">
          <span></span>
          (Nenhum passo dessa etapa impacta a sua loja atual em produção)
        </span>
      </h2>
      <p>Veja como preparar sua loja deco.cx para o Go Live com Magento.</p>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          1º - Criar o domínio {decoSite}.deco.site
        </summary>
        <p>
          Na{" "}
          <a href={`https://admin.deco.cx/sites/${decoSite}`} target="_blank">
            página inicial
          </a>{" "}
          do seu painel na deco.cx.
        </p>
        <p>Clique em "Criar domínio deco.site".</p>
        <img
          class="rounded-lg m-2 border"
          src="https://github.com/deco-cx/apps/assets/76620866/fb13de92-6ba9-4a94-bd97-560360ed125f"
        />
        <p>
          Caso esse botão não esteja disponível para você, peça ao admnistrador
          do site ou no{" "}
          <a
            href="https://discord.com/channels/985687648595243068/1062498956661248010"
            target="_blank"
          >
            canal deco-ajuda-ptbr do discord.
          </a>
        </p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          2º - Alterar o Cookie Domain
        </summary>
        <p>Nessa etapa, altere o domínio dos cookies dentro no Magento</p>
        <ul>
          <li class="ml-2">
            www.storeMagento.com.br ={">"} .storeMagento.com.br
          </li>
        </ul>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          3º - Criar subdomínio que responda na loja atual
        </summary>
        <p>
          Por conta de limitacões do Magento, o checkout não pode ser proxiado.
          Sendo assim, é necessário que haja um segundo domínio para esta
          funcionalidade.
        </p>
        <p>
          No seu serviço de hospedagem, crie um novo subdomínio que responda na
          loja atual. Recomendamos{" "}
          <span class="font-bold">"checkout.storeMagento.com.br"</span>
        </p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          4º - Adicionar redirects do checkout
        </summary>
        <ul>
          <li class="ml-2">
            - No painel da deco, entre em apps/site e procure por "Routes Map".
          </li>
          <li class="ml-2">- Adicione um novo "Magento Proxy Route"</li>
          <li class="ml-2">- Ative "Enable Redirect Routes"</li>
          <li class="ml-2">
            - Digite o subdomínio criado no passo anterior (no caso, apenas o
            termo antes do primeiro ponto - 'checkout', por exemplo)
          </li>
        </ul>
      </details>

      <h2 class="text-2xl font-semibold mt-6">Go Live</h2>
      <p>
        Antes de fazer o Go Live, garanta que o seu site está aprovado em todos
        os pontos da planilha de QA.
      </p>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          1º - Adicionando o domínio na deco
        </summary>
        <p>
          No painel da deco.cx, em{" "}
          <a
            href={`https://admin.deco.cx/sites/${decoSite}/settings`}
            target="_blank"
          >
            configurações
          </a>
          , clique em adicionar domínio existente.
        </p>
        <p>Esse modal deve aparecer:</p>
        <img
          class="rounded-lg m-2 border"
          src="https://github.com/deco-cx/apps/assets/76620866/0c2e39a6-4214-4e1d-86fb-0a31070260f7"
        />
        <p>Clique em Adicionar</p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          2º - Apontando o domíno para a deco
        </summary>
        <p>
          No seu serviço de hospedagem, defina o CNAME do domínio que deseja
          fazer o Go Live, sendo a URL deco.site.
        </p>
        <p>Content: {decoSite}.deco.site</p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          3º - Validando o domínio
        </summary>
        <p>Novamente painel da deco.cx, em configurações.</p>
        <p>Clique nos 3 pontinhos na linha do domínio que deseja validar.</p>
        <p>Depois, clique em Setup.</p>
        <p>Por último, clique em Validate.</p>
        <p>
          Se tudo estiver certo, o domínio deve ser validado e você poderá
          acessá-lo em alguns minutos.
        </p>
      </details>
    </>
  );
}

function GoLiveEnUs({ decoSite }: { decoSite: string }) {
  return (
    <>
      <h2 class="text-2xl font-semibold">
        Preparing to GoLive
        <span class="text-xs font-normal">
          <span></span>
          (None of this steps affects the store in production)
        </span>
      </h2>
      <p>
        Step-by-step of how to prepare your deco.cx store to Go Live with
        Magento.
      </p>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          1º - Create the domain {decoSite}.deco.site
        </summary>
        <p>
          In{" "}
          <a href={`https://admin.deco.cx/sites/${decoSite}`} target="_blank">
            initial page
          </a>{" "}
          of your deco.cx panel
        </p>
        <p>Click in "Create domain deco.site".</p>
        <img
          class="rounded-lg m-2 border"
          src="https://github.com/deco-cx/apps/assets/76620866/fb13de92-6ba9-4a94-bd97-560360ed125f"
        />
        <p>
          If this button is not available to you, ask the site administrator or
          the{" "}
          <a
            href="https://discord.com/channels/985687648595243068/1129139244863070278"
            target="_blank"
          >
            deco-help-en channel on discord.
          </a>
        </p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          2º - Change the Cookie Domain
        </summary>
        <p>In this step, change your cookies domain in Magento</p>
        <ul>
          <li class="ml-2">
            www.storeMagento.com.br ={">"} .storeMagento.com.br
          </li>
        </ul>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          3º - Create subdomain that responds to the current store
        </summary>
        <p>
          For some limitations in Magento, the checkout routes cannot be
          proxied. Therefore, is necessary a second domain to show this routes
        </p>
        <p>
          In your hosting service, create a new subdomain that responds to the
          current store. We recommend:{" "}
          <span class="font-bold">"checkout.storeMagento.com.br"</span>
        </p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          4º - Add checkout redirects
        </summary>
        <ul>
          <li class="ml-2">
            - In deco.cx panel, access apps/site and look for "Routes Map".
          </li>
          <li class="ml-2">- Add a new "Magento Proxy Route"</li>
          <li class="ml-2">- Turn on "Enable Redirect Routes"</li>
          <li class="ml-2">
            - Type the subdomain created in the previus step (in this case, just
            the term before the first dot - 'checkout', for example)
          </li>
        </ul>
      </details>

      <h2 class="text-2xl font-semibold mt-6">Go Live</h2>
      <p>
        Before going Go Live, ensure that your website passes all points in the
        QA spreadsheet.
      </p>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          1º - Adding domain in deco
        </summary>
        <p>
          In deco.cx panel, in{" "}
          <a
            href={`https://admin.deco.cx/sites/${decoSite}/settings`}
            target="_blank"
          >
            settings
          </a>
          , go to "add existing domain".
        </p>
        <p>This message should be displayed:</p>
        <img
          class="rounded-lg m-2 border"
          src="https://github.com/deco-cx/apps/assets/76620866/0c2e39a6-4214-4e1d-86fb-0a31070260f7"
        />
        <p>Click in "Add"</p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          2º - Pointing to deco domain
        </summary>
        <p>
          In your hosting service, define the CNAME of the domain you want to do
          the Go Live. The URL is deco.site
        </p>
        <p>Content: {decoSite}.deco.site</p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          3º - Validating the domain
        </summary>
        <p>Again in deco.cx panel settings:</p>
        <p>
          Click on the 3 dots in the row of the domain you want to
          validate.{" "}
        </p>
        <p>Then click Setup.</p>
        <p>Lastly, click Validate.</p>
        <p>
          If everything looks good, the domain should be validated and you
          should be able to access it in a few minutes.
        </p>
      </details>
    </>
  );
}

function Webhooks() {
  return (
    <>
      <h2 class="text-2xl font-semibold">
        Preparing your webhooks to use as extensions
      </h2>
      <p>
        To use the available Magento extensions, you`ll need to set up an
        webhook for each one.
      </p>
      <LiveloCartWebhook />
      <LiveloProductWebhook />
      <AmastyReviewsWebhook />
    </>
  );
}

function LiveloCartWebhook() {
  return (
    <details>
      <summary class="text-lg font-semibold mt-4 cursor-pointer">
        Livelo Points (Cart)
      </summary>
      <p>This webhook will be used as an Cart extension</p>
      <details class="ml-4">
        <summary class="text-lg font-regular mt-2 cursor-pointer">
          Query
        </summary>
        <p>
          METHOD: <span class="font-semibold">GET</span>
        </p>
        <p>Path Params:</p>
        <p class="ml-4">
          - <span class="font-semibold">quote_id:</span>{" "}
          ID of the cart/quote/bag
        </p>
        <p>
          Example:{" "}
          <span class="underline">
            https://mydomain.com.br/rest/xpto/livelo/cart/$quote_id
          </span>
        </p>
      </details>
      <details class="ml-4">
        <summary class="text-lg font-regular mt-2 cursor-pointer">
          Interface
        </summary>
        <p>
          The <span class="underline">body</span>{" "}
          of the data returned in this webhook{" "}
          <span class="font-bold">MUST FOLLOW</span> the following format:
        </p>
        <p class="ml-4">
          - <span class="font-semibold">phrase:</span> string
        </p>
        <p class="ml-4">
          - <span class="font-semibold">points:</span> number
        </p>
        <p class="ml-4">
          - <span class="font-semibold">factor:</span> number
        </p>
        <p class="ml-4">
          - <span class="font-semibold">message?:</span> string
        </p>
      </details>
    </details>
  );
}

function LiveloProductWebhook() {
  return (
    <details>
      <summary class="text-lg font-semibold mt-4 cursor-pointer">
        Livelo Points (Product)
      </summary>
      <p>
        This webhook will be used as an Product extension. Can be integrated at
        Details Page, Listing Page or Shelves
      </p>
      <details class="ml-4">
        <summary class="text-lg font-regular mt-2 cursor-pointer">
          Query
        </summary>
        <p>
          METHOD: <span class="font-semibold">GET</span>
        </p>
        <p>Path Params:</p>
        <p class="ml-4">
          - <span class="font-semibold">product_id:</span> ID of the product
        </p>
        <p>
          Example:{" "}
          <span class="underline">
            https://mydomain.com.br/rest/xpto/livelo/product/$product_id
          </span>
        </p>
      </details>
      <details class="ml-4">
        <summary class="text-lg font-regular mt-2 cursor-pointer">
          Interface
        </summary>
        <p>
          The <span class="underline">body</span>{" "}
          of the data returned in this webhook{" "}
          <span class="font-bold">MUST FOLLOW</span> the following format:
        </p>
        <p class="ml-4">
          - <span class="font-semibold">phrase:</span> string
        </p>
        <p class="ml-4">
          - <span class="font-semibold">points:</span> number
        </p>
        <p class="ml-4">
          - <span class="font-semibold">factor:</span> number
        </p>
        <p class="ml-4">
          - <span class="font-semibold">message?:</span> string
        </p>
      </details>
    </details>
  );
}

function AmastyReviewsWebhook() {
  return (
    <details>
      <summary class="text-lg font-semibold mt-4 cursor-pointer">
        Reviews Amasty (Product)
      </summary>
      <p>
        This webhook will be used as an Product extension. Can be integrated at
        Details Page, Listing Page or Shelves
      </p>
      <details class="ml-4">
        <summary class="text-lg font-regular mt-2 cursor-pointer">
          Query
        </summary>
        <p>
          METHOD: <span class="font-semibold">GET</span>
        </p>
        <p>Path Params:</p>
        <p class="ml-4">
          - <span class="font-semibold">product_id:</span> ID of the product
        </p>
        <p>
          Example:{" "}
          <span class="underline">
            https://mydomain.com.br/rest/xpto/amasty/reviews/$product_id
          </span>
        </p>
      </details>
      <details class="ml-4">
        <summary class="text-lg font-regular mt-2 cursor-pointer">
          Interface
        </summary>
        <p>
          The <span class="underline">body</span>{" "}
          of the data returned in this webhook{" "}
          <span class="font-bold">MUST FOLLOW</span> the following format:
        </p>
        <p class="ml-4">
          - <span class="font-semibold">success:</span> boolean
        </p>
        <p class="ml-4">
          - <span class="font-semibold">message:</span> string
        </p>
        <p class="ml-4">
          - <span class="font-semibold">summary:</span>
          <p class="ml-8">
            - <span class="font-semibold">reviews_count</span> number
          </p>
        </p>
        <p class="ml-4">
          - <span class="font-semibold">reviews:</span>
          <p class="ml-8">
            - <span class="font-semibold">review_id</span> number
          </p>
          <p class="ml-8">
            - <span class="font-semibold">title</span> string
          </p>
          <p class="ml-8">
            - <span class="font-semibold">detail</span> string
          </p>
          <p class="ml-8">
            - <span class="font-semibold">nickname</span> string
          </p>
          <p class="ml-8">
            - <span class="font-semibold">created_at</span> string
          </p>
          <p class="ml-8">
            - <span class="font-semibold">verified_buyer</span> boolean
          </p>
          <p class="ml-8">
            - <span class="font-semibold">review_stars</span> number
          </p>
          <p class="ml-8">
            - <span class="font-semibold">review_stars_percentage</span> number
          </p>
        </p>
      </details>
    </details>
  );
}
