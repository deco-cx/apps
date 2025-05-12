import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
// O arquivo manifest.gen.ts será gerado automaticamente, então vamos comentar temporariamente
// import manifest, { Manifest } from "./manifest.gen.ts";
// Definir um manifesto temporário até que o manifesto real seja gerado
const manifest = {
    "loaders": {},
    "actions": {},
    "name": "google-sheets2",
    "baseUrl": import.meta.url,
};

// Definir um tipo Manifest temporário
type Manifest = typeof manifest;

import { GoogleSheetsClient } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
    /**
     * @title API Key
     * @description Chave de API do Google Sheets
     */
    apiKey?: string | Secret;

    /**
     * @title OAuth Client ID
     * @description ID do Cliente para OAuth
     */
    clientId?: string;

    /**
     * @title OAuth Client Secret
     * @description Segredo do Cliente para OAuth
     */
    clientSecret?: string | Secret;

    /**
     * @title Refresh Token
     * @description Token de atualização para OAuth (opcional se usar API Key)
     */
    refreshToken?: string | Secret;

    /**
     * @title Access Token
     * @description Token de acesso para OAuth (opcional se usar API Key ou Refresh Token)
     */
    accessToken?: string | Secret;
}

export interface State {
    api: ReturnType<typeof createHttpClient<GoogleSheetsClient>>;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    accessToken?: string;
}

/**
 * @name Google Sheets
 * @description Integração com a API Google Sheets para criar, ler e modificar planilhas
 * @category Produtividade
 * @logo https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Google_Sheets_logo_%282014-2020%29.svg/1498px-Google_Sheets_logo_%282014-2020%29.svg.png
 */
export default function App(props: Props): App<Manifest, State> {
    const {
        apiKey,
        clientId,
        clientSecret,
        refreshToken,
        accessToken,
    } = props;

    // Extração dos valores secretos
    const _apiKey = typeof apiKey === "string" ? apiKey : apiKey?.get?.() ?? undefined;
    const _clientSecret = typeof clientSecret === "string" ? clientSecret : clientSecret?.get?.() ?? undefined;
    const _refreshToken = typeof refreshToken === "string" ? refreshToken : refreshToken?.get?.() ?? undefined;
    const _accessToken = typeof accessToken === "string" ? accessToken : accessToken?.get?.() ?? undefined;

    // Configuração de cabeçalhos baseada na autenticação disponível
    const headers = new Headers();

    if (_accessToken) {
        headers.set("Authorization", `Bearer ${_accessToken}`);
    }

    // Criação do cliente HTTP
    const api = createHttpClient<GoogleSheetsClient>({
        base: "https://sheets.googleapis.com",
        headers,
        fetcher: fetchSafe,
    });

    const state: State = {
        api,
        apiKey: _apiKey,
        clientId,
        clientSecret: _clientSecret,
        refreshToken: _refreshToken,
        accessToken: _accessToken,
    };

    return {
        state,
        manifest,
    };
} 