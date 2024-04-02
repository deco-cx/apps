import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

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
 */
export default function App(
  state: State,
): App<Manifest, State> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;
