import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "apps/utils/fetch.ts";
import { createHttpClient } from "apps/utils/http.ts";
import { PreviewContainer } from "./components/ui/Preview.tsx";
import type { Secret } from "apps/website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { ClientInterfaceExample } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /** @hidden */
  account?: string;

  /** @hidden */
  token?: Secret;
}

// Here we define the state of the app
// You choose what to put in the state
export interface State extends Omit<Props, "token"> {
  api: ReturnType<typeof createHttpClient<ClientInterfaceExample>>;
}

/**
 * @title Stream shop app
 * @description Integration of streamshop services.
 * @category Tools
 * @logo https://cdn.prod.website-files.com/6445b237edd0d4b3293ec173/64615f42bc5c993a71331743_SSHOP_LOGO-p-500.png
 */
export default function App(props: Props): App<Manifest, State> {
  const { token, account: _account } = props;

  const _stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  const api = createHttpClient<ClientInterfaceExample>({
    base: `https://api.github.com/users/guitavano`,
    // headers: new Headers({ "Authorization": `Bearer ${stringToken}` }),
    fetcher: fetchSafe,
  });

  // it is the state of the app, all data
  // here will be available in the context of
  // loaders, actions and workflows
  const state = { ...props, api };

  return {
    state,
    manifest,
  };
}

// It is important to use the same name as the default export of the app
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Stream Shop",
      owner: "Stream Shop",
      description: "This is an app from the Stream Shop",
      logo:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAA8FBMVEWbkdCkjcqsicS1hb6+gbjGfbPPea3VdqjYd6XaeKHdeZ7gepvie5jle5XofJHqfY7tfovwf4jygIXzgoLzhIDzhn7ziHzzinrzjHjzjnbzkHTzknLbeprVhqThg5fccJjdqsLz8/j////k1N/Tk6nZcZ3mtcjttcPsnav98PHikKvhcpLpb4LqwdLs4+zeg5LWlLzt4efnjIzDc67ixNruv83zwMf5z8/rzt/SaqHyd3jzjI3ei5Dw3OjbkJfdttHbnaTYpsfcqrLdt7/OhLPnoLbexMz83t27erX5x8X4urn2ravi1un1n5zQq87Rhq/xiwRQAAABEElEQVR4AaXS06IDMRAA0Nq228wWa29tu///NTWSa8zrCUYmk9litdkdTpfb4/X5A8FQOBKNxRPJVDqT/Tnm8vnCJ1gsIQCq/CFWqlAr0Awqf3gTWM4f4Bkq/B6dgli8ZESDFImSKIsiIPESCigKpeKo6agqGIZRv0YDSGw2W5Wil7vW2e5Al8CeXsGaAH0CxQHWoTYMCUSjC3IPHBMI8hlzg9wNmQmJ0zPOQCz5rzgn6gTHFQHE4BkXFI7yAxn6crNBxV+4HKHWFWf89c+VguMAtbBso2vUwVAXW/gmbJCKYXNL4A4+x/YF8Wz308Mhn8+zbEGSaCDq1EaAxypGbkLrPLIix/E8H2m3v9zb/+MJLe5Gr8K2TA8AAAAASUVORK5CYII=",
      images: [
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/streamshop/e4ce0dd4-1213-4671-acb6-c2d366390d5d/1.png",
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/streamshop/34d3586f-995c-4354-ba52-7e10ef89219f/2.png",
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/streamshop/dc2b7628-4b5f-425e-88ef-b79f79096f48/3.png",
      ],
      tabs: [],
    },
  };
};
