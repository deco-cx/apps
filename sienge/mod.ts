import type { App, FnContext } from "@deco/deco";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Subdomínio
   * @description Subdomínio do cliente no Sienge (ex: minhaempresa)
   */
  subdomain: string;

  /**
   * @title API Username
   * @description Nome de usuário de API configurado no Painel de Integrações
   */
  username: string;

  /**
   * @title API Password
   * @description Senha de API configurada no Painel de Integrações
   */
  password?: string | Secret;
}

// Here we define the state of the app
export interface State extends Props {
  baseUrl: string;
  bulkBaseUrl: string;
  authHeader: string;
}

/**
 * @name Sienge
 * @description Integração com a plataforma Sienge para acesso a APIs de gestão de construção e imobiliário
 * @category ERP
 */
export default function App(props: Props): App<Manifest, State> {
  const { subdomain, username, password: _password } = props;

  const password = typeof _password === "string"
    ? _password
    : _password?.get?.() ?? "";

  // Criando o header de autenticação Basic
  const credentials = btoa(`${username}:${password}`);
  const authHeader = `Basic ${credentials}`;

  // Base URLs para as APIs REST e Bulk Data
  const baseUrl = `https://api.sienge.com.br/${subdomain}/public/api/v1`;
  const bulkBaseUrl =
    `https://api.sienge.com.br/${subdomain}/public/api/bulk-data/v1`;

  // Estado da app que será disponibilizado para todos os loaders e actions
  const state = {
    ...props,
    baseUrl,
    bulkBaseUrl,
    authHeader,
  };

  return {
    state,
    manifest,
  };
}
