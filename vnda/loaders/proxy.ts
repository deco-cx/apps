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
  "/entrar/*",
  "/images/*",
  "/javascripts/*",
  "/loja/configuracoes",
  "/pagamento/*",
  "/pedido/*",
  "/recaptcha",
  "/recuperar_senha",
  "/sair",
  "/sitemap/vnda.xml",
  "/stylesheets/*",
  "/v/s",
  "/webform",
];

const API_PATHS = [
  "/api/*",
];

const decoSiteMapUrl = "/sitemap/deco.xml";

const VNDA_HOST_HEADER = "X-Shop-Host";
export interface Props {
  /** @description ex: /p/fale-conosco */
  pagesToProxy?: string[];
  generateDecoSiteMap?: boolean;
  /**
   * @title Exclude paths from /deco-sitemap.xml
   */
  excludePathsFromDecoSiteMap?: string[];
  includeSiteMap?: string[];
}

/**
 * @title VNDA Proxy Routes
 */
function loader(
  {
    pagesToProxy = [],
    generateDecoSiteMap,
    excludePathsFromDecoSiteMap = [],
    includeSiteMap,
  }: Props,
  _req: Request,
  { publicUrl, account }: AppContext,
): Route[] {
  const internalDomain = `https://${account}.cdn.vnda.com.br/`;
  const url = new URL(
    publicUrl?.startsWith("http") ? publicUrl : `https://${publicUrl}`,
  );

  const customHeaders = [{ key: VNDA_HOST_HEADER, value: url.hostname }];

  const [include, routes] = generateDecoSiteMap
    ? [
      [...(includeSiteMap ?? []), decoSiteMapUrl],
      [{
        pathTemplate: decoSiteMapUrl,
        handler: {
          value: {
            excludePaths: excludePathsFromDecoSiteMap,
            __resolveType: "website/handlers/sitemap.ts",
          },
        },
      }],
    ]
    : [includeSiteMap, []];

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
        avoidAppendPath: pathTemplate === "/sitemap/vnda.xml",
        url: pathTemplate === "/sitemap/vnda.xml"
          ? `https://sitemap.vnda.com.br/preview/${publicUrl}`
          : internalDomain,
        host: url.hostname,
        customHeaders,
      },
    },
  }));

  const siteMap = {
    pathTemplate: "/sitemap.xml",
    handler: {
      value: {
        include,
        __resolveType: "vnda/handlers/sitemap.ts",
        customHeaders,
      },
    },
  };

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

  return [...routes, ...internalDomainPaths, siteMap, ...apiDomainPaths];
}

export default loader;
