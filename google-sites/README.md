# Google Sites (MCP App)

Permite buscar conteúdo e extrair links de sites criados no Google Sites para uso em agentes e automações.

## Features

- OAuth2 com Google
- Ferramentas (loaders):
  - extractAllLinks: Extrai todos os links de um Google Site
  - searchContent: Busca textual no conteúdo de um Google Site

## Estrutura

- mod.ts
- manifest.gen.ts
- actions/
  - oauth/callback.ts
- loaders/
  - oauth/start.ts
  - extractAllLinks.ts
  - searchContent.ts
- utils/
  - client.ts
  - constant.ts
  - types.ts

## OAuth

Este app utiliza OAuth2 do Google. Os escopos usados (devem estar configurados no seu projeto Google Cloud):

- https://www.googleapis.com/auth/userinfo.email
- https://www.googleapis.com/auth/userinfo.profile
- https://www.googleapis.com/auth/drive.readonly

Dica: Garanta que o Redirect URI usado no fluxo esteja cadastrado no Console do Google Cloud (Credentials → OAuth 2.0 Client IDs).

### Fluxo

1. Inicie o OAuth com o loader oauth/start:
   - Parâmetros:
     - clientId: Client ID do app no Google Cloud
     - redirectUri: URI de redirecionamento (deve coincidir com o cadastrado no Google Cloud)
     - state: string aleatória para validação

2. O usuário autoriza no Google e você recebe um `code` no `redirectUri`.

3. Troque o `code` por tokens com a action actions/oauth/callback:
   - Parâmetros:
     - code
     - installId: ID de instalação do app
     - clientId
     - clientSecret
     - redirectUri (o mesmo do passo 1)

Ao final, os tokens são salvos na instalação e o app poderá usar as tools.

## Exemplos de uso das Tools

### extractAllLinks

- Entrada (props):
  - siteId: string — ID do arquivo do Google Site no Drive

- Retorno:
  - links: Array<{ anchorText, linkUrl, isInternal }>
  - total: number

Exemplo (props):
```json
{
  "siteId": "1AbCdEfG..."
}
```

Retorno (exemplo):
```json
{
  "links": [
    { "anchorText": "Home", "linkUrl": "/home", "isInternal": true },
    { "anchorText": "Docs", "linkUrl": "https://sites.google.com/...", "isInternal": true },
    { "anchorText": "Blog", "linkUrl": "https://blog.exemplo.com", "isInternal": false }
  ],
  "total": 3
}
```

### searchContent

- Entrada (props):
  - siteId: string
  - query: string
  - page?: number = 1
  - pageSize?: number = 10

- Retorno:
  - results: Array<{ pageTitle, relevantParagraph }>
  - total: number

Exemplo (props):
```json
{
  "siteId": "1AbCdEfG...",
  "query": "política de privacidade",
  "page": 1,
  "pageSize": 5
}
```

Retorno (exemplo):
```json
{
  "results": [
    { "pageTitle": "Meu Site", "relevantParagraph": "Nossa política de privacidade descreve..." }
  ],
  "total": 12
}
```

## Dicas

- Se as tools não aparecerem após alterações, reinicie o processo de desenvolvimento e reinstale o app como MCP.
- Confirme que `manifest.gen.ts` contém as entradas dos loaders e actions.
- Após alterar escopos, refaça o fluxo OAuth (start → callback).
