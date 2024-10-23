import type { JSX } from "preact";
import { PreviewContainer } from "../../utils/preview.tsx";
import { App } from "../mod.ts";
import { type AppRuntime, type BaseContext, Context } from "@deco/deco";
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
    <PreviewContainer
      name="VTEX"
      owner="deco.cx"
      description="This document will help you set up the app and launch your VTEX store efficiently. The information is divided into three main sections: General Information, App Configuration, and Go Live Preparations. Follow each section carefully to ensure a successful integration."
      logo="https://raw.githubusercontent.com/deco-cx/apps/main/vtex/logo.png"
      images={[
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/starting/bf2e259d-7f69-49d6-9e8e-d848e4a57d8a/image-(4).png",
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/starting/1f917616-74af-475c-8af7-0693a0b786b0/ciber.jpg",
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/starting/ab1ad5ca-946a-4ce2-a3d1-d9d0b2317fc0/salesapp.webp",
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/starting/0f8a7710-73f0-4d12-b864-44056faad710/insights.png",
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/starting/c00732eb-59a5-4465-ad1f-58e8fa0ce8a4/gif-vtex.gif",
      ]}
      tabs={[
        {
          title: "About",
          content: <app.markdownContent />,
        },
        {
          title: "Go Live",
          content: (
            <GoLivePtBr
              decoSite={decoSite}
              withoutSubDomain={withoutSubDomain}
              account={account}
            />
          ),
        },
        {
          title: "Indexing",
          content: <Indexing />,
        },
      ]}
    />
  );
};
export function Indexing() {
  return (
    <div>
      <p>
        If you wish to index VTEX's product data into deco, click in the button
        below. Beware this is a very costly operation that may influence on your
        page views quota
      </p>
      <div style="display: flex; justify-content: center; padding: 8px">
        <form target="_blank" action="/live/invoke/workflows/actions/start.ts">
          <input
            style="display: none"
            name="props"
            value="eyJrZXkiOiJ2dGV4L3dvcmtmbG93cy9wcm9kdWN0L2luZGV4LnRzIn0"
          />
          <button style="color: white; background-color: #F71963; border-radius: 4px; padding: 4px 8px">
            Start indexing workflow
          </button>
        </form>
      </div>
    </div>
  );
}
export function GoLivePtBr({ decoSite, withoutSubDomain, account }: {
  decoSite: string;
  withoutSubDomain: string;
  account: string;
}) {
  return (
    <>
      <h2 class="text-2xl">
        Preparativos
      </h2>

      <details>
        <summary class="text-lg mt-4 cursor-pointer">
          1º - Adicionar os domínios a VTEX
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
        <summary class="text-lg mt-4 cursor-pointer">
          2º - Fazer o apontamento do domínio secure.{withoutSubDomain}
        </summary>
        <p>
          No seu serviço de hospedagem, defina o CNAME para o subdomínio secure.
        </p>
        <p>Content: secure.{withoutSubDomain}.cdn.vtex.com</p>
      </details>

      <details>
        <summary class="text-lg mt-4 cursor-pointer">
          3º - Preencher o publicUrl da sua App
        </summary>
        <p>
          Na sua App, preencha o campo publicUrl com o domínio secure da sua
          loja. <span class="text-xs font-normal">(Form a esquerda)</span>
        </p>
      </details>

      <h2 class="text-2xl mt-6">Go Live</h2>

      <details>
        <summary class="text-lg mt-4 cursor-pointer">
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
        <summary class="text-lg mt-4 cursor-pointer">
          2º - Apontando o domíno para a deco
        </summary>
        <p>
          No seu serviço de hospedagem, defina o CNAME do domínio que deseja
          fazer o Go Live, sendo a URL deco.site.
        </p>
        <p>Content: {decoSite}.deco.site</p>
      </details>

      <details>
        <summary class="text-lg mt-4 cursor-pointer">
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
