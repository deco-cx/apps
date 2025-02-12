import { Markdown } from "../decohub/components/Markdown.tsx";
import { PreviewContainer } from "../utils/preview.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";
import { type App, type AppContext as AC } from "@deco/deco";
export type Agency =
  | "2B Digital"
  | "Adaptio"
  | "Agência E-plus"
  | "Agência MKT Now"
  | "Agência N1"
  | "Allfa"
  | "Allomni"
  | "Auaha"
  | "Avanti"
  | "B8One"
  | "Betminds"
  | "Box Ideias"
  | "Codeblue"
  | "Codeby"
  | "Corebiz"
  | "Econverse"
  | "ED3"
  | "Eficaz Marketing"
  | "Four2One"
  | "FRN Comunicação"
  | "Iryasolutions"
  | "Keyrus"
  | "M3Ecommerce"
  | "Maeztra"
  | "Quality Digital"
  | "Quickdigital"
  | "Saga Partners"
  | "Social Commerce"
  | "Tec4Udigital"
  | "The Goal - Agência Cross-Commerce"
  | "Thealfred"
  | "Wave Commerce"
  | "Wecode"
  | "Wedigi"
  | "Wicomm";
export interface State {
  serviceProvider?: Agency;
  /**
   * @format date
   */
  expectedGoLive?: string;
}
/**
 * @title Implementer
 * @description The agency that's implementing your store
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/ai-assistants/logo.png
 */
export default function App(state: State): App<Manifest, State> {
  return { manifest, state };
}
export type AppContext = AC<ReturnType<typeof App>>;
export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "Implementer",
      owner: "deco.cx",
      description: "The agency that's implementing your store",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/ai-assistants/logo.png",
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
