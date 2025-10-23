# Plano para Criação do App Spotify

## Visão Geral

O app Spotify permitirá que desenvolvedores integrem funcionalidades do Spotify
em suas aplicações através de uma interface TypeScript tipada. O app utilizará a
API Web do Spotify para fornecer acesso a catálogo de música, controles de
reprodução, playlists, perfil do usuário e muito mais.

## Estrutura do App

### 1. client.ts

O arquivo `client.ts` definirá a interface TypeScript para todos os endpoints da
API do Spotify:

#### Principais Endpoints a Implementar:

**Albums**

- `GET /albums/{id}` - Obter informações de um álbum
- `GET /albums` - Obter vários álbuns
- `GET /albums/{id}/tracks` - Obter faixas de um álbum

**Artists**

- `GET /artists/{id}` - Obter informações de um artista
- `GET /artists` - Obter vários artistas
- `GET /artists/{id}/albums` - Obter álbuns de um artista
- `GET /artists/{id}/top-tracks` - Obter faixas mais populares do artista
- `GET /artists/{id}/related-artists` - Obter artistas relacionados

**Tracks**

- `GET /tracks/{id}` - Obter informações de uma faixa
- `GET /tracks` - Obter várias faixas

**Playlists**

- `GET /playlists/{playlist_id}` - Obter playlist
- `GET /playlists/{playlist_id}/tracks` - Obter itens da playlist
- `POST /playlists/{playlist_id}/tracks` - Adicionar itens à playlist
- `PUT /playlists/{playlist_id}/tracks` - Atualizar itens da playlist
- `DELETE /playlists/{playlist_id}/tracks` - Remover itens da playlist
- `GET /playlists/{playlist_id}/images` - Obter imagem da playlist
- `PUT /playlists/{playlist_id}/images` - Adicionar imagem personalizada da
  playlist

**Search**

- `GET /search` - Buscar por itens (álbuns, artistas, playlists, faixas, shows,
  episódios, audiobooks)

**User Profile**

- `GET /me` - Obter perfil do usuário atual
- `GET /me/playlists` - Obter playlists do usuário

**Library**

- `GET /me/albums` - Obter álbuns salvos do usuário
- `PUT /me/albums` - Salvar álbuns para o usuário
- `DELETE /me/albums` - Remover álbuns salvos
- `GET /me/albums/contains` - Verificar se álbuns estão salvos

**Player**

- `GET /me/player` - Obter estado de reprodução
- `PUT /me/player` - Transferir reprodução
- `GET /me/player/devices` - Obter dispositivos disponíveis
- `GET /me/player/currently-playing` - Obter faixa atual
- `PUT /me/player/play` - Iniciar/retomar reprodução
- `PUT /me/player/pause` - Pausar reprodução
- `POST /me/player/next` - Pular para próxima
- `POST /me/player/previous` - Voltar para anterior

**Shows & Episodes**

- `GET /shows/{id}` - Obter show
- `GET /shows` - Obter vários shows
- `GET /shows/{id}/episodes` - Obter episódios do show
- `GET /episodes/{id}` - Obter episódio
- `GET /episodes` - Obter vários episódios

**Audiobooks & Chapters**

- `GET /audiobooks/{id}` - Obter audiobook
- `GET /audiobooks` - Obter vários audiobooks
- `GET /chapters/{id}` - Obter capítulo
- `GET /chapters` - Obter vários capítulos

**Following**

- `GET /me/following` - Obter artistas seguidos
- `PUT /me/following` - Seguir artistas ou usuários
- `DELETE /me/following` - Deixar de seguir artistas ou usuários

#### Tipos de Dados Principais

- `SpotifyAlbum` - Informações do álbum
- `SpotifyArtist` - Informações do artista
- `SpotifyTrack` - Informações da faixa
- `SpotifyPlaylist` - Informações da playlist
- `SpotifyUser` - Informações do usuário
- `SpotifyShow` - Informações do show
- `SpotifyEpisode` - Informações do episódio
- `SpotifyAudiobook` - Informações do audiobook
- `SpotifyChapter` - Informações do capítulo
- `SpotifyDevice` - Informações do dispositivo
- `SpotifyPlaybackState` - Estado da reprodução
- `SpotifySearchResult` - Resultado da busca

### 2. mod.ts

O arquivo `mod.ts` configurará o app com as seguintes propriedades:

```typescript
export interface Props {
  /**
   * @title Client ID
   * @description ID do cliente da aplicação Spotify
   */
  clientId?: string;

  /**
   * @title Client Secret
   * @description Secret do cliente da aplicação Spotify
   */
  clientSecret?: string | Secret;

  /**
   * @title Access Token
   * @description Token de acesso OAuth2 do Spotify
   */
  accessToken?: string | Secret;

  /**
   * @title Refresh Token
   * @description Token de refresh OAuth2 do Spotify
   */
  refreshToken?: string | Secret;

  /**
   * @title Scope
   * @description Escopos de permissão OAuth2
   */
  scope?: string;

  /**
   * @title Token Type
   * @description Tipo do token (geralmente "Bearer")
   */
  tokenType?: string;
}
```

### 3. Configuração OAuth2

O app Spotify implementará suporte completo ao OAuth2 seguindo os padrões dos
outros apps da plataforma.

#### 3.1. Variáveis de Ambiente

Para usar CLIENT_ID e CLIENT_SECRET como variáveis de ambiente:

```bash
# No seu .env ou configuração do sistema
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

#### 3.2. Constantes OAuth

Criar `utils/constants.ts`:

```typescript
export const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-playback-position",
  "user-top-read",
  "user-read-recently-played",
  "user-library-read",
  "user-library-modify",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-follow-read",
  "user-follow-modify",
  "streaming",
].join(" ");

export const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
export const SPOTIFY_OAUTH_AUTHORIZE_URL =
  "https://accounts.spotify.com/authorize";
export const SPOTIFY_OAUTH_TOKEN_URL = "https://accounts.spotify.com/api/token";
```

#### 3.3. Loader OAuth Start

Criar `loaders/oauth/start.ts`:

```typescript
import {
  SPOTIFY_OAUTH_AUTHORIZE_URL,
  SPOTIFY_SCOPES,
} from "../../utils/constants.ts";

interface Props {
  state: string;
  redirectUri: string;
  clientId: string;
  scopes?: string;
}

/**
 * @title OAuth Start
 * @description Inicia o fluxo de autorização OAuth2 do Spotify
 */
export default function start(props: Props) {
  const authParams = new URLSearchParams({
    client_id: props.clientId || Deno.env.get("SPOTIFY_CLIENT_ID") || "",
    redirect_uri: props.redirectUri,
    response_type: "code",
    scope: props.scopes || SPOTIFY_SCOPES,
    state: props.state,
    // show_dialog pode ser adicionado como parâmetro opcional se necessário
  });

  const authorizationUrl =
    `${SPOTIFY_OAUTH_AUTHORIZE_URL}?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
```

#### 3.4. Action OAuth Callback

Criar `actions/oauth/callback.ts`:

```typescript
import { AppContext } from "../../mod.ts";
import { SPOTIFY_OAUTH_TOKEN_URL } from "../../utils/constants.ts";

interface Props {
  installId?: string;
  code: string;
  redirectUri: string;
  clientSecret: string;
  clientId: string;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

/**
 * @title OAuth Callback
 * @description Processa o callback do OAuth2 e troca o código por tokens
 */
export default async function callback(
  { code, redirectUri, clientSecret, clientId, installId }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  installId?: string;
  account?: string;
}> {
  const currentCtx = await ctx.getConfiguration();

  // Usar env vars como fallback
  const finalClientId = clientId || Deno.env.get("SPOTIFY_CLIENT_ID") || "";
  const finalClientSecret = clientSecret ||
    Deno.env.get("SPOTIFY_CLIENT_SECRET") || "";

  const response = await fetch(SPOTIFY_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${finalClientId}:${finalClientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await response.json() as SpotifyTokenResponse;

  if (!response.ok) {
    throw new Error(`OAuth error: ${tokenData.error || "Unknown error"}`);
  }

  // Configurar o contexto com os novos tokens
  await ctx.configure({
    ...currentCtx,
    clientId: finalClientId,
    clientSecret: finalClientSecret,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    scope: tokenData.scope,
    tokenType: tokenData.token_type,
  });

  // Obter informações do usuário para retornar o account
  const account = await ctx.invoke.spotify.loaders.users.getCurrentUser({})
    .then((user) => user.display_name || user.id)
    .catch(console.error) || undefined;

  return {
    installId,
    account,
  };
}
```

#### 3.5. Loader Who Am I

Criar `loaders/oauth/whoami.ts`:

```typescript
import { AppContext } from "../../mod.ts";

/**
 * @title Who Am I
 * @description Obtém informações do usuário atual autenticado
 */
export default async function whoami(
  _props: {},
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["GET /me"]({});
  return await response.json();
}
```

#### 3.6. Atualização do mod.ts

Atualizar `mod.ts` para suportar OAuth:

```typescript
import type { App, FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import { SPOTIFY_API_BASE_URL } from "./utils/constants.ts";
import { SpotifyClient } from "./client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Props {
  clientId?: string;
  clientSecret?: string | Secret;
  accessToken?: string | Secret;
  refreshToken?: string | Secret;
  scope?: string;
  tokenType?: string;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<SpotifyClient>>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @title Spotify
 * @description Integração com a API Web do Spotify
 * @category Music
 * @logo https://developer.spotify.com/images/guidelines/logos/spotify-logo-green.png
 */
export default function App(props: Props): App<Manifest, State> {
  const {
    accessToken,
    clientId = Deno.env.get("SPOTIFY_CLIENT_ID"),
    clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET"),
  } = props;

  const finalAccessToken = typeof accessToken === "string"
    ? accessToken
    : accessToken?.get?.() ?? "";

  const api = createHttpClient<SpotifyClient>({
    base: SPOTIFY_API_BASE_URL,
    headers: new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(finalAccessToken
        ? {
          "Authorization": `Bearer ${finalAccessToken}`,
        }
        : {}),
    }),
    fetcher: fetchSafe,
  });

  const state: State = {
    ...props,
    api,
    clientId: clientId || "",
    clientSecret: clientSecret || "",
  };

  return {
    state,
    manifest,
  };
}
```

#### 3.7. Renovação Automática de Tokens

Para implementar renovação automática de tokens, criar `utils/auth.ts`:

```typescript
import { SPOTIFY_OAUTH_TOKEN_URL } from "./constants.ts";

export interface TokenRefreshResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

export async function refreshSpotifyToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<TokenRefreshResponse> {
  const response = await fetch(SPOTIFY_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const tokenData = await response.json() as TokenRefreshResponse;

  if (!response.ok) {
    throw new Error(
      `Token refresh error: ${tokenData.error || "Unknown error"}`,
    );
  }

  return tokenData;
}
```

#### 3.8. Scopes Necessários

Diferentes operações requerem diferentes scopes:

- **Leitura de Perfil**: `user-read-private`, `user-read-email`
- **Controle de Reprodução**: `user-modify-playback-state`,
  `user-read-playback-state`
- **Biblioteca**: `user-library-read`, `user-library-modify`
- **Playlists**: `playlist-read-private`, `playlist-modify-private`
- **Histórico**: `user-read-recently-played`, `user-top-read`
- **Streaming**: `streaming` (para Web Playback SDK)

#### 3.9. Configuração no Spotify Dashboard

1. Acesse https://developer.spotify.com/dashboard
2. Crie um novo app ou use existente
3. Configure as Redirect URIs:
   - `http://localhost:8000/oauth/callback` (desenvolvimento)
   - `https://yourdomain.com/oauth/callback` (produção)
4. Copie CLIENT_ID e CLIENT_SECRET para as variáveis de ambiente

#### 3.10. Como Usar as Variáveis de Ambiente

O app está configurado para usar automaticamente as variáveis de ambiente
`SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET`. Isso significa que:

1. **Em desenvolvimento**: Defina as variáveis no seu `.env` local
2. **Em produção**: Configure as variáveis no seu provedor de hospedagem
3. **No deco.ts**: Não é necessário fornecer clientId/clientSecret no código
4. **Flexibilidade**: Você ainda pode override via props se necessário

Exemplo de uso:

```typescript
// Usando apenas env vars (recomendado)
app("spotify", {
  // clientId e clientSecret serão lidos automaticamente das env vars
});

// Ou override se necessário
app("spotify", {
  clientId: "custom_client_id",
  clientSecret: "custom_secret",
});
```

### 4. Actions

Principais actions a serem implementadas:

**Playlist Management**

- `actions/playlists/addTracks.ts` - Adicionar faixas à playlist
- `actions/playlists/removeTracks.ts` - Remover faixas da playlist
- `actions/playlists/updateDetails.ts` - Atualizar detalhes da playlist
- `actions/playlists/uploadCover.ts` - Fazer upload de capa da playlist

**Library Management**

- `actions/library/saveAlbum.ts` - Salvar álbum na biblioteca
- `actions/library/removeAlbum.ts` - Remover álbum da biblioteca
- `actions/library/saveTrack.ts` - Salvar faixa na biblioteca
- `actions/library/removeTrack.ts` - Remover faixa da biblioteca

**Player Control**

- `actions/player/play.ts` - Iniciar reprodução
- `actions/player/pause.ts` - Pausar reprodução
- `actions/player/next.ts` - Próxima faixa
- `actions/player/previous.ts` - Faixa anterior
- `actions/player/seek.ts` - Buscar posição na faixa
- `actions/player/setVolume.ts` - Definir volume
- `actions/player/transferPlayback.ts` - Transferir reprodução

**User Management**

- `actions/users/followArtist.ts` - Seguir artista
- `actions/users/unfollowArtist.ts` - Deixar de seguir artista
- `actions/users/followPlaylist.ts` - Seguir playlist
- `actions/users/unfollowPlaylist.ts` - Deixar de seguir playlist

### 5. Loaders

Principais loaders a serem implementados:

**Catalog**

- `loaders/albums/getAlbum.ts` - Obter álbum por ID
- `loaders/albums/getAlbums.ts` - Obter múltiplos álbuns
- `loaders/albums/getAlbumTracks.ts` - Obter faixas do álbum
- `loaders/artists/getArtist.ts` - Obter artista por ID
- `loaders/artists/getArtists.ts` - Obter múltiplos artistas
- `loaders/artists/getArtistAlbums.ts` - Obter álbuns do artista
- `loaders/artists/getArtistTopTracks.ts` - Obter faixas populares do artista
- `loaders/artists/getRelatedArtists.ts` - Obter artistas relacionados
- `loaders/tracks/getTrack.ts` - Obter faixa por ID
- `loaders/tracks/getTracks.ts` - Obter múltiplas faixas

**Search**

- `loaders/search/search.ts` - Buscar por itens

**User Profile**

- `loaders/users/getCurrentUser.ts` - Obter perfil do usuário atual
- `loaders/users/getUserPlaylists.ts` - Obter playlists do usuário

**Library**

- `loaders/library/getSavedAlbums.ts` - Obter álbuns salvos
- `loaders/library/getSavedTracks.ts` - Obter faixas salvas
- `loaders/library/checkSavedAlbums.ts` - Verificar se álbuns estão salvos
- `loaders/library/checkSavedTracks.ts` - Verificar se faixas estão salvas

**Player**

- `loaders/player/getPlaybackState.ts` - Obter estado da reprodução
- `loaders/player/getCurrentTrack.ts` - Obter faixa atual
- `loaders/player/getDevices.ts` - Obter dispositivos disponíveis
- `loaders/player/getQueue.ts` - Obter fila de reprodução

**Playlists**

- `loaders/playlists/getPlaylist.ts` - Obter playlist
- `loaders/playlists/getPlaylistTracks.ts` - Obter faixas da playlist
- `loaders/playlists/getFeaturedPlaylists.ts` - Obter playlists em destaque

**Shows & Episodes**

- `loaders/shows/getShow.ts` - Obter show
- `loaders/shows/getShows.ts` - Obter múltiplos shows
- `loaders/shows/getShowEpisodes.ts` - Obter episódios do show
- `loaders/episodes/getEpisode.ts` - Obter episódio
- `loaders/episodes/getEpisodes.ts` - Obter múltiplos episódios

**Following**

- `loaders/following/getFollowedArtists.ts` - Obter artistas seguidos
- `loaders/following/checkFollowingArtists.ts` - Verificar se segue artistas
- `loaders/following/checkFollowingPlaylists.ts` - Verificar se segue playlists

### 6. Tratamento de Erros

Implementar tratamento robusto de erros:

- Rate limiting (429 Too Many Requests)
- Tokens expirados (401 Unauthorized)
- Permissões insuficientes (403 Forbidden)
- Recursos não encontrados (404 Not Found)

### 7. Configuração no deco.ts

Adicionar entrada no arquivo raiz `deco.ts`:

```typescript
const config = {
  apps: [
    // ... outros apps
    app("spotify"),
  ],
  // ...
};
```

### 8. Manifest

Gerar `manifest.gen.ts` executando `deno task start` no diretório raiz.

## Progresso Atual ✅

### Concluído:

1. ✅ `client.ts` - Interfaces TypeScript para todos os endpoints e tipos
2. ✅ `utils/constants.ts` - URLs OAuth e scopes do Spotify
3. ✅ `mod.ts` - Configuração do app com suporte completo ao OAuth
4. ✅ `loaders/oauth/start.ts` - Iniciar fluxo OAuth
5. ✅ `actions/oauth/callback.ts` - Processar callback OAuth
6. ✅ `loaders/oauth/whoami.ts` - Verificar usuário autenticado
7. ✅ `loaders/users/getCurrentUser.ts` - Obter perfil do usuário
8. ✅ `loaders/search/search.ts` - Buscar conteúdo no Spotify
9. ✅ `loaders/albums/getAlbum.ts` - Obter álbum específico
10. ✅ `loaders/artists/getArtist.ts` - Obter artista específico
11. ✅ `deco.ts` - Adicionado app("spotify") à configuração
12. ✅ `manifest.gen.ts` - Manifest inicial gerado

### Em Progresso:

- Implementação dos métodos restantes da API do Spotify

## Status Atual: 20 Loaders + 5 Actions ✅

### Implementado:

**Loaders (20):** albums(3), artists(4), library(1), oauth(2), player(2),
playlists(2), search(1), tracks(2), users(2), whoami(1) **Actions (5):**
library(1), oauth(1), player(2), playlists(1)

## Métodos Faltantes Críticos (Baseado no api.yaml)

### 🎯 Alta Prioridade - Faltando:

**Saved Tracks (Biblioteca de Faixas):**

- `loaders/library/getSavedTracks.ts` - GET /me/tracks
- `loaders/library/checkSavedTracks.ts` - GET /me/tracks/contains
- `actions/library/saveTracks.ts` - PUT /me/tracks
- `actions/library/removeTracks.ts` - DELETE /me/tracks
- `actions/library/removeAlbums.ts` - DELETE /me/albums

**Player Controls Avançados:**

- `loaders/player/getCurrentTrack.ts` - GET /me/player/currently-playing
- `loaders/player/getRecentlyPlayed.ts` - GET /me/player/recently-played
- `loaders/player/getQueue.ts` - GET /me/player/queue
- `actions/player/next.ts` - POST /me/player/next
- `actions/player/previous.ts` - POST /me/player/previous
- `actions/player/seek.ts` - PUT /me/player/seek
- `actions/player/setRepeat.ts` - PUT /me/player/repeat
- `actions/player/setShuffle.ts` - PUT /me/player/shuffle
- `actions/player/setVolume.ts` - PUT /me/player/volume
- `actions/player/transferPlayback.ts` - PUT /me/player

**Top Items & Personalization:**

- `loaders/users/getTopArtists.ts` - GET /me/top/artists
- `loaders/users/getTopTracks.ts` - GET /me/top/tracks

**Following:**

- `loaders/following/getFollowedArtists.ts` - GET /me/following
- `loaders/following/checkFollowingArtists.ts` - GET /me/following/contains
- `actions/following/followArtists.ts` - PUT /me/following
- `actions/following/unfollowArtists.ts` - DELETE /me/following

**Playlists Avançadas:**

- `loaders/playlists/getFeaturedPlaylists.ts` - GET /browse/featured-playlists
- `actions/playlists/removeTracks.ts` - DELETE /playlists/{id}/tracks
- `actions/playlists/updatePlaylist.ts` - PUT /playlists/{id}

### 🔥 Média Prioridade:

**Shows/Episodes (Podcasts):**

- `loaders/shows/getShow.ts` - GET /shows/{id}
- `loaders/library/getSavedShows.ts` - GET /me/shows
- `actions/library/saveShows.ts` - PUT /me/shows

**Audiobooks:**

- `loaders/audiobooks/getAudiobook.ts` - GET /audiobooks/{id}
- `loaders/library/getSavedAudiobooks.ts` - GET /me/audiobooks

**Categories & Browse:**

- `loaders/browse/getCategories.ts` - GET /browse/categories
- `loaders/browse/getCategoryPlaylists.ts` - GET
  /browse/categories/{id}/playlists

## Próximos Passos

1. Implementar loaders restantes (albums, artists, tracks)
2. Implementar loaders de playlists
3. Implementar loaders de biblioteca e player
4. Implementar actions de controle de reprodução
5. Implementar actions de gerenciamento de biblioteca
6. Implementar actions de playlists
7. Testar integração completa
8. Documentar uso e exemplos

## Considerações Especiais

- **Rate Limiting**: A API do Spotify possui limites rigorosos de taxa
- **Scopes**: Diferentes endpoints requerem diferentes permissões OAuth2
- **Mercados**: Muitos endpoints suportam parâmetro de mercado para localização
- **Paginação**: Implementar suporte adequado à paginação de resultados
- **Tipos Opcionais**: Muitos campos podem ser null dependendo do contexto
- **Formatos de ID**: Suportar tanto IDs quanto URIs do Spotify
- **Resposta de Arrays**: Quando um endpoint da API do Spotify retorna apenas um
  array, deve ser wrapped em um objeto `{ data: [...] }` para manter
  consistência na estrutura de resposta dos loaders e actions
