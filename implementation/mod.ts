import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type Agency =
  | "Agência E-plus"
  | "Agência N1"
  | "Codeby"
  | "Betminds"
  | "Wedigi"
  | "Eficaz Marketing"
  | "Agência MKT Now"
  | "Adaptio"
  | "2B Digital"
  | "Wave Commerce"
  | "Tec4Udigital"
  | "B8One"
  | "FRN Comunicação"
  | "Quickdigital"
  | "Econverse"
  | "Allomni"
  | "Auaha"
  | "Box Ideias"
  | "Thealfred"
  | "Iryasolutions"
  | "Wicomm"
  | "Wecode"
  | "M3Ecommerce"
  | "Four2One"
  | "Avanti"
  | "Corebiz"
  | "Social Commerce"
  | "ED3"
  | "Saga Partners"
  | "The Goal - Agência Cross-Commerce"
  | "Keyrus"
  | "Maeztra"
  | "Quality Digital"
  | "Codeblue"
  | "Allfa";

export interface State {
  serviceProvider?: Agency;
  /**
   * @format date
   */
  expectedGoLive?: string;
}

/**
 * @title implementation
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;
