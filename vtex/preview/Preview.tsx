import { AppRuntime } from "deco/types.ts";
import { App } from "../mod.ts";

import { context } from "deco/live.ts";
import { BaseContext } from "deco/engine/core/resolver.ts";
import { Markdown } from "../../decohub/components/Markdown.tsx";

export interface Props {
  publicUrl: string;
}

export const PreviewVtex = (app: AppRuntime<BaseContext, App["state"]>) => {
  console.log("ctx", app.state.publicUrl);
  console.log("ctx", context.site);
  const decoSite = context.site;
  const publicUrl = app.state?.publicUrl || "";
  const account = app.state?.account || "";

  const withoutSubDomain = publicUrl.split(".").slice(1).join(".");
  const siteName = publicUrl.split(".")[1];
  const endUrl = publicUrl.split(".")[2];

  return (
    <div style={{ height: "100%", padding: "0px 16px" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            a{
                color: #111827;
                font-weight: 600;
                text-decoration: underline;
            }
            `,
        }}
      >
      </style>
      <div>
        <a href="https://vtex.com/" class="flex justify-center py-4">
          <img
            alt="VTEX"
            src="https://github.com/deco-cx/apps/assets/1753396/d1877649-a569-4826-b595-2dc1bd8ab20c"
            width="250"
          />
        </a>
      </div>
      <details>
        <summary
          class="text-left text-2xl cursor-pointer py-4"
          style={{
            width: "30%",
          }}
        >
          General Information
        </summary>
        <div>
        </div>
      </details>
      <details open>
        <summary
          class="text-lef text-2xl cursor-pointer py-4"
          style={{
            width: "30%",
          }}
        >
          Go Live
        </summary>
        <ul
          class="px-4"
          style={{
            position: "absolute",
            width: "70%",
            top: "140px",
            right: "2%",
            background: "white",
            boxShadow: "0px 0px 5px 3px rgba(0,0,0,0.20)",
            padding: "16px",
            borderRadius: "16px",
          }}
        >
          <h2 class="text-2xl font-semibold">
            Preparativos
            <span class="text-xs font-normal">
              (Nenhum passo dessa etapa impacta a sua loja atual em produção.)
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
              Caso esse botão não esteja disponível para você, peça ao
              admnistrador do site ou no canal deco-ajuda do discord.
            </p>
          </details>

          <details>
            <summary class="text-lg font-semibold mt-4 cursor-pointer">
              2º - Adicionar os domínios a VTEX
            </summary>
            <p>
              Nessa etapa, adicione os seguintes domínios na lista de domínios
              VTEX.
            </p>
            <ul>
              <li class="ml-2">- {decoSite}.deco.site</li>
              <li class="ml-2">- secure.{withoutSubDomain}</li>
            </ul>
            <p>
              Para adicionar domínios na VTEX, entre{" "}
              <a href={`https://${account}.myvtex.com/admin/account/stores/`} target="_blank">nessa página</a>.
            </p>
          </details>

          <details>
            <summary class="text-lg font-semibold mt-4 cursor-pointer">
              3º - Fazer o apontamento do domínio secure.{withoutSubDomain}
            </summary>
            <p>
              No seu serviço de hospedagem, defina o CNAME para o subdomínio
              secure.
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
            Antes de fazer o Go Live, garanta que o seu site está aprovado em
            todos os pontos da planilha de QA.
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
        </ul>
      </details>
    </div>
  );
};
