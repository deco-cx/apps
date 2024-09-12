import { Markdown } from "../decohub/components/Markdown.tsx";
import { createHttpClient } from "../utils/http.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { API } from "./utils/client.ts";
import { type App, type AppContext as AC } from "@deco/deco";
export interface Props {
  customer: string;
}
export interface State extends Props {
  api: ReturnType<typeof createHttpClient<API>>;
}
/**
 * @title konfidency
 */
export default function App(state: State): App<Manifest, State> {
  const api = createHttpClient<API>({
    base: `https://reviews-api.konfidency.com.br`,
  });
  return { manifest, state: { ...state, api } };
}
export type AppContext = AC<ReturnType<typeof App>>;
export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "Konfidency",
      owner: "deco.cx",
      description: "Product's reviews and store reviews.",
      logo:
        "https://auth.deco.cx/storage/v1/object/public/assets/1/user_content/konfidency.png",
      images: [],
      tabs: [
        {
          title: "About",
          content: markdownContent(),
        },
      ],
    },
  };
};
