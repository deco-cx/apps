import type { AppContext } from "../../mod.ts";
import { OAUTH_URL_TOKEN } from "../../utils/constants.ts";
import { fetchBasesAndTables } from "../../utils/ui-templates/airtable-client.ts";
import {
  AirtableBase,
  AirtableTable,
  generateSelectionPage,
} from "../../utils/ui-templates/page-generator.ts";

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope: string;
}

export interface Props {
  /**
   * @title Authorization Code
   * @description The authorization code received from Airtable
   */
  code: string;

  /**
   * @title State
   * @description The state parameter returned from authorization (contains code_verifier)
   */
  state: string;

  /**
   * @title Install ID
   * @description Unique identifier for this installation
   */
  installId: string;

  /**
   * @title Client ID
   * @description The OAuth client ID from your Airtable app
   */
  clientId: string;

  /**
   * @title Client Secret
   * @description The OAuth client secret from your Airtable app
   * @format password
   */
  clientSecret: string;

  /**
   * @title Redirect URI
   * @description The same redirect URI used in the authorization request
   */
  redirectUri: string;

  /**
   * @title Query Params
   * @description The query parameters from the request
   */
  queryParams: Record<string, string>;
}

// Function to extract code_verifier from state
function extractCodeVerifier(state: string): string | null {
  try {
    console.log("Attempting to parse state:", state);
    const stateData = JSON.parse(atob(state));
    console.log("Parsed state data:", stateData);
    const codeVerifier = stateData.code_verifier || null;
    console.log(
      "Extracted code_verifier:",
      codeVerifier ? "found" : "not found",
    );
    return codeVerifier;
  } catch (error) {
    console.error("Failed to parse state parameter:", error);
    return null;
  }
}

async function _saveBase(
  baseId: string,
  installId: string,
  appName: string,
  _req: Request,
  ctx: AppContext,
) {
  const currentCtx = await ctx.getConfiguration();
  await ctx.configure({
    ...currentCtx,
    baseId: baseId,
  });
  return {
    installId,
    appName: appName + "teste",
  };
}

interface StateProvider {
  original_state?: string;
  code_verifier?: string;
}
interface State {
  appName: string;
  installId: string;
  invokeApp: string;
  returnUrl?: string | null;
  redirectUri?: string | null;
}

function decodeState(state: string): State & StateProvider {
  const decoded = atob(decodeURIComponent(state));
  const parsed = JSON.parse(decoded) as State & StateProvider;

  if (parsed.original_state) {
    return decodeState(parsed.original_state);
  }

  return parsed;
}

/**
 * @title OAuth Callback
 * @description Exchanges the authorization code for access tokens with PKCE support
 */
export default async function callback(
  {
    code,
    state,
    installId,
    clientId,
    clientSecret,
    redirectUri,
    queryParams,
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Response | Record<string, unknown>> {
  const { isSaveBase, skip } = queryParams;

  if (isSaveBase) {
    const { baseId, selectedBases, selectedTables } = queryParams;
    const teste = decodeState(state);
    console.log("Estado decodificado:", teste);

    // Se usuário pulou a seleção, retorna apenas o installId
    if (skip === "true") {
      console.log("Usuário pulou a seleção de bases/tabelas");
      return {
        installId: teste.installId,
        appName: teste.appName + " - Configuração Pulada",
        message:
          "Configuração concluída sem seleção específica de bases/tabelas",
      };
    }

    console.log("Bases selecionadas:", selectedBases);
    console.log("Tabelas selecionadas:", selectedTables);

    // Processa as bases e tabelas selecionadas
    const basesArray = selectedBases ? selectedBases.split(",") : [];
    const tablesArray = selectedTables ? selectedTables.split(",") : [];

    // Salva a configuração com as seleções do usuário
    const currentCtx = await ctx.getConfiguration();
    await ctx.configure({
      ...currentCtx,
      selectedBases: basesArray,
      selectedTables: tablesArray,
      baseId: baseId || basesArray[0], // usa o primeiro baseId se não especificado
    });

    return {
      installId: teste.installId,
      appName: teste.appName + " - Configurado",
      message:
        `Configuração salva com sucesso! Bases: ${basesArray.length}, Tabelas: ${tablesArray.length}`,
      selectedBases: basesArray,
      selectedTables: tablesArray,
    };
  }

  try {
    const uri = redirectUri || new URL("/oauth/callback", _req.url).href;

    const codeVerifier = extractCodeVerifier(state);
    if (!codeVerifier) {
      throw new Error(
        "code_verifier not found in state parameter. PKCE is required for Airtable OAuth.",
      );
    }

    const credentials = btoa(`${clientId}:${clientSecret}`);

    const tokenRequestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: uri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(OAUTH_URL_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: tokenRequestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token exchange failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const tokenData = await response.json() as OAuthTokenResponse;
    const currentTime = Math.floor(Date.now() / 1000);

    const currentCtx = await ctx.getConfiguration();
    await ctx.configure({
      ...currentCtx,
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
        token_type: tokenData.token_type,
        tokenObtainedAt: currentTime,
      },
      clientSecret: clientSecret,
      clientId: clientId,
    });

    const newURL = _req.url + "&isSaveBase=true&baseId=app1234567890";

    // Busca bases e tabelas reais do Airtable usando os tokens obtidos
    let bases: AirtableBase[] = [];
    let tables: AirtableTable[] = [];

    try {
      const data = await fetchBasesAndTables(tokenData);
      bases = data.bases;
      tables = data.tables;
    } catch (error) {
      console.error("Erro ao buscar dados do Airtable:", error);
      bases = [
        { id: "app1234567890", name: "Base Exemplo", recordCount: 0 },
      ];
      tables = [
        {
          id: "tbl1111111111",
          name: "Tabela Exemplo",
          recordCount: 0,
          baseId: "app1234567890",
        },
      ];
    }

    // Gera o HTML com a interface de seleção
    const selectionHtml = generateSelectionPage({
      bases,
      tables,
      callbackUrl: newURL,
    });

    // Use selectionHtml em vez de htmlWithRedirect para mostrar a interface de seleção
    return new Response(selectionHtml, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return {
      installId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
