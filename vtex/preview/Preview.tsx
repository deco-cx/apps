import { AppRuntime } from "deco/types.ts";
import { App } from "../mod.ts";
import type { JSX } from "preact";
import { Context } from "deco/live.ts";
import { BaseContext } from "deco/engine/core/resolver.ts";

export interface Props {
  publicUrl: string;
}

export const PreviewVtex = (
  app: AppRuntime<BaseContext, App["state"]> & {
    markdownContent: () => JSX.Element;
  },
) => {
  const context = Context.active();
  const decoSite = context.site;
  const publicUrl = app.state?.publicUrl || "";
  const account = app.state?.account || "";
  const withoutSubDomain = publicUrl.split(".").slice(1).join(".");
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
        <a href="https://vtex.com/" class="flex justify-center py-4">
          <VtexSvg />
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
            <GoLivePtBr
              decoSite={decoSite}
              withoutSubDomain={withoutSubDomain}
              account={account}
            />
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

function VtexSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="304.60388"
      height="109.53113"
      viewBox="0 0 304.60388 109.53113"
    >
      <defs id="defs6" />
      <g
        id="Page-1"
        stroke="none"
        stroke-width="1"
        fill="none"
        fill-rule="evenodd"
        transform="translate(-48.186108,-47.31959)"
      >
        <g id="Artboard" fill-rule="nonzero" fill="#ff3366">
          <g id="vtex-logo" transform="translate(48,47)">
            <path
              d="m 220.35,41.34 h -10.92 v 37.38 c -0.005,0.704658 -0.57534,1.274558 -1.28,1.28 h -8.41 c -0.70466,-0.0054 -1.27456,-0.575342 -1.28,-1.28 V 41.34 h -11 c -0.33306,0.01356 -0.65736,-0.108641 -0.89866,-0.338623 C 186.32005,40.771395 186.18243,40.453328 186.18,40.12 V 33.5 c 0.002,-0.333328 0.14005,-0.651395 0.38134,-0.881377 0.2413,-0.229982 0.5656,-0.352182 0.89866,-0.338623 h 32.87 c 0.70901,-0.03402 1.3123,0.511172 1.35,1.22 v 6.62 c -0.0377,0.700724 -0.62863,1.242773 -1.33,1.22 z"
              id="Shape"
            />
            <path
              d="m 255.37,79.75 c -4.30509,0.615781 -8.65146,0.896624 -13,0.84 -8.29,0 -15.61,-2.12 -15.61,-13.81 V 45.45 c 0,-11.69 7.39,-13.74 15.67,-13.74 4.31504,-0.05911 8.62812,0.218397 12.9,0.83 0.9,0.13 1.28,0.45 1.28,1.28 v 6 c -0.005,0.704658 -0.57534,1.274558 -1.28,1.28 h -13.5 c -3,0 -4.11,1 -4.11,4.37 v 5.84 h 17.14 c 0.70466,0.0054 1.27456,0.575342 1.28,1.28 v 6.1 c -0.005,0.704658 -0.57534,1.274558 -1.28,1.28 h -17.14 v 6.81 c 0,3.34 1.09,4.37 4.11,4.37 h 13.54 c 0.70466,0.0054 1.27456,0.575342 1.28,1.28 v 6 c 0.01,0.8 -0.38,1.19 -1.28,1.32 z"
              id="path9"
            />
            <path
              d="m 303.83,80 h -10.21 c -0.71202,0.0529 -1.38046,-0.347368 -1.67,-1 l -8.86,-14 -8,13.74 c -0.45,0.77 -0.9,1.28 -1.61,1.28 H 264 c -0.24831,0.04452 -0.50356,-0.02356 -0.69672,-0.18581 C 263.11012,79.671935 262.99901,79.432264 263,79.18 c 0.0131,-0.157131 0.0573,-0.310094 0.13,-0.45 L 277.06,55.54 263,33.5 c -0.0725,-0.118382 -0.11698,-0.251786 -0.13,-0.39 0.0476,-0.506319 0.49306,-0.880511 1,-0.84 h 10.34 c 0.71,0 1.22,0.64 1.61,1.22 l 8.22,13 8,-13 c 0.28992,-0.657457 0.89863,-1.118721 1.61,-1.22 h 9.51 c 0.50694,-0.04051 0.9524,0.333681 1,0.84 -0.013,0.138214 -0.0575,0.271618 -0.13,0.39 l -14,22.17 14.57,23 c 0.11259,0.195504 0.17768,0.414728 0.19,0.64 -0.12,0.44 -0.45,0.69 -0.96,0.69 z"
              id="path11"
            />
            <path
              d="m 170.8,32.41 c -0.47969,-0.01067 -0.89936,0.320862 -1,0.79 l -9.33,34.52 c -0.13,0.71 -0.32,1 -0.9,1 -0.58,0 -0.77,-0.26 -0.9,-1 l -9.3,-34.52 c -0.10064,-0.469138 -0.52031,-0.800674 -1,-0.79 h -9.18 c -0.30814,-0.0076 -0.60256,0.127382 -0.79796,0.36577 -0.1954,0.238388 -0.26995,0.553566 -0.20204,0.85423 0,0 11.39,39.57 11.51,40 1.52,4.72 5.21,7 9.9,7 4.49956,0.161453 8.55216,-2.704023 9.9,-7 0.18,-0.54 11.32,-40 11.32,-40 0.0643,-0.2992 -0.0119,-0.611392 -0.20682,-0.847296 C 180.41822,32.5468 180.12596,32.413159 179.82,32.42 Z"
              id="path13"
            />
            <path
              d="M 118.77,0.32 H 23.05 C 19.586315,0.35166678 16.388901,2.1841531 14.61068,5.1567016 12.832459,8.12925 12.729906,11.813127 14.34,14.88 l 9.58,18.24 H 6.56 C 4.3421294,33.079643 2.2685207,34.216027 1.109161,36.107181 -0.05019865,37.998335 -0.12215931,40.361817 0.92,42.32 l 30.8,58.2 c 1.10523,2.09008 3.275685,3.39759 5.64,3.39759 2.364314,0 4.53477,-1.30751 5.64,-3.39759 l 8.36,-15.77 10.5,19.86 c 1.707211,3.22421 5.056702,5.24072 8.705,5.24072 3.648297,0 6.997789,-2.01651 8.705,-5.24072 l 48,-90.25 c 1.5893,-2.970574 1.49395,-6.5591519 -0.25085,-9.4411411 C 125.27436,2.0368696 122.13886,0.28884316 118.77,0.32 Z M 76,38.45 55,77.83 c -0.7215,1.360201 -2.13529,2.210648 -3.675,2.210648 -1.53971,0 -2.953501,-0.850447 -3.675,-2.210648 l -20.73,-39 C 26.280421,37.629796 26.317769,36.18196 27.018378,35.016327 27.718987,33.850695 28.980019,33.138359 30.34,33.14 h 42.42 c 1.27814,-0.01967 2.471383,0.638051 3.1372,1.729251 0.665817,1.0912 0.704917,2.453148 0.1028,3.580749 z"
              id="path15"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

function GoLivePtBr(
  { decoSite, withoutSubDomain, account }: {
    decoSite: string;
    withoutSubDomain: string;
    account: string;
  },
) {
  return (
    <>
      <h2 class="text-2xl font-semibold">
        Preparativos
        <span class="text-xs font-normal">
          <span></span>
          (Nenhum passo dessa etapa impacta a sua loja atual em produção)
        </span>
      </h2>
      <p>Veja como preparar sua loja deco.cx para o Go Live com VTEX.</p>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          1º - Criar o domínio {decoSite}.deco.site
        </summary>
        <p>
          Na{" "}
          <a
            href={`https://admin.deco.cx/sites/${decoSite}`}
            target="_blank"
          >
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
          do site ou no canal deco-ajuda do discord.
        </p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          2º - Adicionar os domínios a VTEX
        </summary>
        <p>
          Nessa etapa, adicione os seguintes domínios na lista de domínios VTEX.
        </p>
        <ul>
          <li class="ml-2">- {decoSite}.deco.site</li>
          <li class="ml-2">- secure.{withoutSubDomain}</li>
        </ul>
        <p>
          Para adicionar domínios na VTEX, entre{" "}
          <a
            href={`https://${account}.myvtex.com/admin/account/stores/`}
            target="_blank"
          >
            nessa página
          </a>.
        </p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          3º - Fazer o apontamento do domínio secure.{withoutSubDomain}
        </summary>
        <p>
          No seu serviço de hospedagem, defina o CNAME para o subdomínio secure.
        </p>
        <p>Content: secure.{withoutSubDomain}.cdn.vtex.com</p>
      </details>

      <details>
        <summary class="text-lg font-semibold mt-4 cursor-pointer">
          4º - Preencher o publicUrl da sua App
        </summary>
        <p>
          Na sua App, preencha o campo publicUrl com o domínio secure da sua
          loja. <span class="text-xs font-normal">(Form a esquerda)</span>
        </p>
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
          </a>, clique em adicionar domínio existente.
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
        <p>
          Clique nos 3 pontinhos na linha do domínio que deseja validar.
        </p>
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
