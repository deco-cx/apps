import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";

const PAGE_PATHS = [
  "/admin",
  "/admin/*",
  "/carrinho",
  "/carrinho/*",
  "/cdn-cgi/*",
  "/cep",
  "/cep/*",
  "/checkout/*",
  "/common/*",
  "/components/*",
  "/conta",
  "/conta/*",
  "/cupom/ajax",
  "/entrar",
  "/images/*",
  "/javascripts/*",
  "/loja/configuracoes",
  "/pagamento/*",
  "/pedido/*",
  "/recaptcha",
  "/recuperar_senha",
  "/sair",
  "/sitemap.xml",
  "/stylesheets/*",
  "/v/s",
  "/webform",
];

const API_PATHS = [
  "/api/*",
];

const VNDA_HOST_HEADER = "X-Shop-Host";
export interface Props {
  /** @description ex: /p/fale-conosco */
  pagesToProxy?: string[];
  siteMap?: string;
}

/**
 * @title VNDA Proxy Routes
 */
function loader(
  { pagesToProxy = [], siteMap }: Props,
  _req: Request,
  { publicUrl, account }: AppContext,
): Route[] {
  const internalDomain = `https://${account}.cdn.vnda.com.br/`;
  const url = new URL(
    publicUrl?.startsWith("http") ? publicUrl : `https://${publicUrl}`,
  );

  const customHeaders = [{ key: VNDA_HOST_HEADER, value: url.hostname }];

  const internalDomainPaths = [
    ...PAGE_PATHS,
    ...pagesToProxy,
  ].map((
    pathTemplate,
  ) => ({
    pathTemplate,
    handler: {
      value: {
        __resolveType: "website/handlers/proxy.ts",
        url: pathTemplate === "sitemap.xml"
          ? (siteMap ? siteMap : internalDomain)
          : internalDomain,
        host: url.hostname,
        customHeaders,
      },
    },
  }));

  const apiDomainPaths = API_PATHS.map((pathTemplate) => ({
    pathTemplate,
    handler: {
      value: {
        __resolveType: "website/handlers/proxy.ts",
        url: `https://api.vnda.com.br/`,
        host: url.hostname,
        customHeaders,
      },
    },
  }));

  return [...internalDomainPaths, ...apiDomainPaths];
}

export default loader;
