import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { FigmaClient } from "./client.ts";
import { Secret } from "../website/loaders/secret.ts";

export interface Props {
  /**
   * @description Token de acesso da API do Figma para autenticação
   */
  accessToken: string | Secret;
}

export interface State extends Props {
  figma: FigmaClient;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @name FIGMA
 * @title Figma
 * @description Um app Deco para interagir com as APIs do Figma com respostas fortemente tipadas
 */
export default function App(props: Props): App<Manifest, State> {
  const figma = new FigmaClient(
    typeof props.accessToken === "string" ? props.accessToken : props.accessToken.get()!,
  );

  return {
    state: {
      ...props,
      figma,
    },
    manifest,
  };
}

// Re-exporta tipos do cliente para conveniência
export * from "./client.ts"; 