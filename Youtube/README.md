# App do YouTube

Este aplicativo fornece integração com a API do YouTube, permitindo diversas operações como busca de vídeos, visualização de comentários e atualizações de vídeos.

## Recursos

### Vídeos
- Busca de vídeos
- Detalhes de vídeos
- Listagem de vídeos por canal
- Análise de vídeos
- Atualização de miniaturas
- Atualização de metadados de vídeos (título, descrição, tags, etc.)
- Gerenciamento de categorias de vídeos
- Exclusão de vídeos

### Canal
- Configuração de informações básicas (título, descrição, trailer)
- Organização de seções da página do canal
- Configuração de valores padrão para novos uploads
- Gerenciamento de branding e personalização

### Legendas
- Listagem de legendas disponíveis para vídeos
- Recuperação do texto completo de legendas em diferentes formatos (SRT, SBV, VTT)

### Comentários
- Listagem de comentários de vídeos
- Envio de comentários em vídeos
- Resposta a comentários existentes
- Curtir comentários
- Pinar comentários em vídeos (proprietários do vídeo)

### Transmissões ao Vivo
- Criação e agendamento de transmissões ao vivo
- Configuração de streams de vídeo (RTMP)
- Vinculação de streams com transmissões
- Alteração de status (testar, iniciar, finalizar)
- Listagem de transmissões (agendadas, ativas, finalizadas)
- Monitoramento do status de transmissões
- Exclusão de transmissões

### Analytics
- Estatísticas do canal (visualizações, tempo de exibição, inscritos)
- Métricas de desempenho de vídeos específicos
- Dados demográficos e de audiência (idade, gênero, região)
- Análises por período de tempo personalizado

## Exemplos de Uso

### Configurar Informações do Canal

```typescript
// Atualizar informações básicas do canal
const resultado = await action({
  channelId: "CANAL_ID",
  title: "Meu Canal do YouTube",
  description: "Canal de conteúdo sobre programação e tecnologia",
  unsubscribedTrailer: "VIDEO_ID_DO_TRAILER", // Vídeo que aparece para não inscritos
  keywords: ["tecnologia", "programação", "dicas"],
  country: "BR"
}, req);
```

### Configurar Seções do Canal

```typescript
// Definir quais seções aparecem na página do canal
const secoes = await action({
  sections: [
    // Seção de uploads recentes
    {
      type: "recentUploads",
      style: "horizontalRow",
      title: "Vídeos Recentes",
      position: 0,
      showForNotSubscribed: true
    },
    // Seção com uma playlist específica
    {
      type: "singlePlaylist",
      style: "horizontalRow",
      title: "Playlist em Destaque",
      playlists: ["PLAYLIST_ID"],
      position: 1
    },
    // Seção com canais recomendados
    {
      type: "multipleChannels",
      title: "Canais Parceiros",
      channels: ["CANAL_ID_1", "CANAL_ID_2"],
      position: 2
    }
  ],
  // Opcionalmente remover seções existentes
  removeSectionIds: ["SECTION_ID_1", "SECTION_ID_2"]
}, req);
```

### Configurar Padrões para Novos Vídeos

```typescript
// Definir configurações padrão para novos uploads
const padroesUpload = await action({
  privacyStatus: "unlisted", // Vídeos começam como não listados
  license: "youtube",
  embeddable: true, // Permite incorporar vídeos em outros sites
  categoryId: "28", // Ciência e tecnologia
  tags: ["tutorial", "educacional"],
  defaultCommentSetting: "enabled", // Comentários habilitados por padrão
  defaultLanguage: "pt-BR"
}, req);
```

### Buscar Estatísticas do Canal

```typescript
// Obter estatísticas gerais do canal nos últimos 30 dias
const estatisticas = await loader({
  channelId: "channel==CANAL_ID",
  startDate: "2024-03-01",
  endDate: "2024-03-31",
  metrics: "views,estimatedMinutesWatched,subscribersGained", // opcional
  dimensions: "day", // opcional
  sort: "day" // opcional
}, req);
```

### Analisar Desempenho de Vídeos

```typescript
// Obter métricas de desempenho dos vídeos do canal
const estatisticasVideos = await loader({
  channelId: "channel==CANAL_ID",
  startDate: "2024-03-01",
  endDate: "2024-03-31",
  metrics: "views,likes,comments,shares",
  dimensions: "video",
  sort: "-views" // ordenado por mais visualizações
}, req);

// Ou analisar um vídeo específico
const estatisticasVideo = await loader({
  channelId: "channel==CANAL_ID",
  videoId: "VIDEO_ID",
  startDate: "2024-03-01",
  endDate: "2024-03-31",
}, req);
```

### Analisar Audiência

```typescript
// Obter dados demográficos da audiência
const audiencia = await loader({
  channelId: "channel==CANAL_ID",
  startDate: "2024-03-01",
  endDate: "2024-03-31",
  dimensions: "ageGroup,gender,country"
}, req);

// Acessar dados específicos
const distribuicaoPorIdade = audiencia.demographics.ageGroups;
const distribuicaoPorGenero = audiencia.demographics.genders;
const distribuicaoPorPais = audiencia.demographics.countries;
```

### Enviar e Pinar Comentário

```typescript
// Enviar um comentário e piná-lo ao mesmo tempo
const resultado = await action({
  videoId: "ID_DO_VIDEO",
  text: "Este é um comentário importante!",
  pinComment: true // Isso exige que você seja proprietário do vídeo
}, req);

// Ou pinar um comentário existente
const pinado = await action({
  commentId: "ID_DO_COMENTARIO"
}, req);
```

### Curtir Comentário

```typescript
// Dar like em um comentário
const resultadoLike = await action({
  commentId: "ID_DO_COMENTARIO",
  rating: "like" // pode ser "like", "dislike" ou "none" (para remover avaliação)
}, req);
```

### Criar e Gerenciar Transmissões ao Vivo

```typescript
// 1. Criar uma transmissão ao vivo agendada
const transmissao = await action({
  title: "Minha Transmissão ao Vivo",
  description: "Uma transmissão sobre programação e tecnologia",
  scheduledStartTime: "2024-06-15T19:00:00Z", // Data e hora de início
  scheduledEndTime: "2024-06-15T21:00:00Z",   // Opcional: data e hora de término
  privacyStatus: "unlisted",                  // "private", "public" ou "unlisted"
  enableDvr: true,                            // Permite reprodução posterior
  enableAutoStart: true,                      // Inicia automaticamente quando detectar streaming
  enableAutoStop: true                        // Finaliza automaticamente quando o stream parar
}, req);

// 2. Criar um stream de vídeo (para conectar seu software de streaming)
const stream = await action({
  title: "Stream Principal",
  description: "Stream principal para transmissões ao vivo",
  ingestionType: "rtmp",          // "rtmp" é o mais comum
  resolution: "1080p",            // Resolução de saída
  frameRate: "60fps",             // Taxa de quadros 
  isReusable: true                // Pode ser reutilizado em várias transmissões
}, req);

// 3. Vincular o stream à transmissão
const vinculo = await action({
  broadcastId: transmissao.broadcast.id,
  streamId: stream.stream.id
}, req);

// 4. Iniciar teste da transmissão (antes de ir ao vivo)
const testar = await action({
  broadcastId: transmissao.broadcast.id,
  transitionType: "testing"
}, req);

// 5. Iniciar transmissão ao vivo (após testar)
const aoVivo = await action({
  broadcastId: transmissao.broadcast.id,
  transitionType: "live"
}, req);

// 6. Finalizar transmissão
const finalizar = await action({
  broadcastId: transmissao.broadcast.id,
  transitionType: "complete"
}, req);

// 7. Listar transmissões do canal com tratamento de erros
// Método 1: Usando seu próprio channelId com filtro de status (recomendado)
const transmissoesAgendadas = await loader({
  channelId: "SEU_CHANNEL_ID", // Use channelId em vez de mine quando precisar filtrar por status
  broadcastStatus: "upcoming",  // "active", "completed" ou "upcoming"
  maxResults: 25               // 1-50 resultados
}, req);

// Método 2: Usando mine=true (sem filtro de status)
const todasMinhasTransmissoes = await loader({
  mine: true,                 // Retorna todas as suas transmissões sem filtro de status
  maxResults: 25              // 1-50 resultados
}, req);

// Método 3: Buscar uma transmissão específica por ID
const transmissaoEspecifica = await loader({
  broadcastId: "ID_DA_TRANSMISSAO"
}, req);

// Verificar se há erro na resposta
if ('error' in transmissoesAgendadas && transmissoesAgendadas.error) {
  console.error(`Erro: ${transmissoesAgendadas.message}`);
  // Exibir mensagem de erro para o usuário
} else {
  // Processar os dados da resposta
  console.log(`Encontradas ${transmissoesAgendadas.items.length} transmissões agendadas`);
  
  // Verificar se há mensagem informativa
  if (transmissoesAgendadas.infoMessage) {
    console.log(`Informação: ${transmissoesAgendadas.infoMessage}`);
  }
}

// 8. Listar streams de vídeo com tratamento de erros
const streams = await loader({
  mine: true,
  maxResults: 50
}, req);

// Verificar se há erro na resposta
if ('error' in streams && streams.error) {
  console.error(`Erro ao listar streams: ${streams.message}`);
  
  // Verificar se é um erro de autorização
  if (streams.code === 401 || streams.code === 403) {
    console.log("É necessário conceder permissão para acessar streams de vídeo");
  }
} else {
  console.log(`Encontrados ${streams.items.length} streams de vídeo`);
  
  // Verificar se há mensagem informativa
  if (streams.infoMessage) {
    console.log(`Informação: ${streams.infoMessage}`);
  }
}

// 9. Atualizar uma transmissão existente
const atualizar = await action({
  broadcastId: transmissao.broadcast.id,
  title: "Novo título da transmissão",
  description: "Nova descrição atualizada",
  privacyStatus: "public", // Alterando de não-listado para público
  enableDvr: true,         // Ativando DVR
  madeForKids: false       // Definindo que não é conteúdo para crianças
}, req);

// 10. Excluir uma transmissão
const deletar = await action({
  broadcastId: transmissao.broadcast.id
}, req);
```

### Atualizar Categoria de Vídeo

```typescript
// Primeiro, liste as categorias disponíveis
const categorias = await loader({
  regionCode: "BR", // Código de região (opcional, padrão: BR)
}, req);

// Em seguida, atualize a categoria do vídeo
const resultado = await action({
  videoId: "ID_DO_VIDEO",
  categoryId: "10", // 10 para Música, consulte a listagem para outras categorias
}, req);
```

### Excluir Vídeo

```typescript
// Excluir um vídeo do canal
const resultado = await action({
  videoId: "ID_DO_VIDEO"
}, req);

// Verificar o resultado da operação
if (resultado.success) {
  console.log(resultado.message); // "Vídeo excluído com sucesso"
} else {
  console.error(`Falha ao excluir vídeo: ${resultado.message}`);
  // Tratar erro específico
  if (resultado.error) {
    console.error("Detalhes do erro:", resultado.error);
  }
}
```

### Categorias Comuns

- 1: Filmes e animação
- 2: Automóveis
- 10: Música
- 15: Animais
- 17: Esportes
- 20: Jogos
- 22: Pessoas e blogs
- 23: Comédia
- 24: Entretenimento
- 25: Notícias e política
- 27: Educação
- 28: Ciência e tecnologia

### Obter Texto de Legendas

```typescript
// Primeiro, liste as legendas disponíveis para um vídeo
const legendas = await loader({
  videoId: "ID_DO_VIDEO"
}, req);

// Depois, obtenha o texto completo de uma legenda específica
if (legendas && legendas.items.length > 0) {
  const textoLegenda = await loader({
    captionId: legendas.items[0].id,
    format: "srt", // Formato desejado: "srt", "sbv" ou "vtt"
  }, req);
}
```

## Autenticação

A maioria das operações requer autenticação com uma conta do YouTube. Use o endpoint de autenticação para obter um token de acesso.

## Escopos de Autorização Necessários

Dependendo da funcionalidade, você precisará solicitar diferentes escopos de autorização:

- `https://www.googleapis.com/auth/youtube` - Para gerenciamento completo da conta
- `https://www.googleapis.com/auth/youtube.readonly` - Para operações somente leitura
- `https://www.googleapis.com/auth/youtube.force-ssl` - Para comentários e outras operações seguras
- `https://www.googleapis.com/auth/yt-analytics.readonly` - Para acesso aos dados de analytics
- `https://www.googleapis.com/auth/youtube.channel-memberships.creator` - Para gerenciar assinaturas do canal
- `https://www.googleapis.com/auth/youtube.upload` - Para fazer upload de vídeos
- `https://www.googleapis.com/auth/youtube.livestream` - Para gerenciar transmissões ao vivo

## Resolução de Problemas

### Erros Comuns da API do YouTube

#### Erro: "Not Found" em operações de comentários

Algumas operações com comentários, como curtir ou responder, podem falhar com erro 404 "Not Found". Isso geralmente ocorre porque as APIs de comentários do YouTube esperam que os parâmetros sejam enviados na URL (como query parameters) e não no corpo da requisição.

**Solução**: Para operações como curtir comentários ou definir status de moderação, use parâmetros na URL em vez de incluí-los no corpo da requisição:

```typescript
// CORRETO: Enviar parâmetros via URL
const url = new URL("https://youtube.googleapis.com/youtube/v3/comments/rate");
url.searchParams.append("id", commentId);
url.searchParams.append("rating", rating);

const response = await fetch(url.toString(), {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Length": "0" // Sem corpo na requisição
  }
});
```

#### Erro: "branding_settings cannot be used with other parts"

Ao atualizar configurações do canal, você pode receber este erro se tentar modificar configurações de branding junto com outras partes do canal ao mesmo tempo.

**Solução**: Faça atualizações de branding em chamadas separadas das outras configurações do canal:

```typescript
// Primeira chamada: apenas branding
await action({
  channelId: "CANAL_ID",
  branding: {
    bannerUrl: "URL_BANNER",
    logoUrl: "URL_LOGO"
  }
}, req);

// Segunda chamada: outras configurações 
await action({
  channelId: "CANAL_ID",
  title: "Novo Título",
  description: "Nova descrição"
}, req);
```

#### Erro: "Forbidden" ou "Permission denied" em operações de comentários

Este erro pode ocorrer quando você tenta modificar comentários sem as permissões adequadas.

**Solução**: 
1. Verifique se você tem o escopo de autorização correto (`https://www.googleapis.com/auth/youtube.force-ssl`)
2. Para operações como pinar comentários, você precisa ser o proprietário do vídeo
3. Para curtir comentários, você precisa estar autenticado como um usuário válido

#### Erros em Transmissões ao Vivo

##### Erro: "Incompatible parameters specified in the request: broadcastStatus, mine" (400)

A API do YouTube não permite usar os parâmetros `broadcastStatus` e `mine` juntos na mesma requisição ao listar transmissões.

**Solução**:
- Se você precisa filtrar por status (upcoming, active, completed), use apenas o `channelId` sem o parâmetro `mine`:
  ```typescript
  // Correto: Usando channelId + broadcastStatus
  const transAgendadas = await loader({
    channelId: "SEU_CHANNEL_ID",
    broadcastStatus: "upcoming" // funciona com channelId
  }, req);
  ```

- Se precisar usar o filtro `mine: true`, não especifique `broadcastStatus`:
  ```typescript
  // Correto: Usando apenas mine (sem filtrar por status)
  const minhasTransmissoes = await loader({
    mine: true // isso retorna todas as transmissões suas
  }, req);
  ```

- Se você precisa de um ID específico, use apenas o `broadcastId`:
  ```typescript
  // Correto: Buscando por ID específico
  const transmissaoEspecifica = await loader({
    broadcastId: "ID_DA_TRANSMISSAO"
  }, req);
  ```

##### Erro: "The broadcast status is invalid for this operation" (400)

Este erro ocorre quando você tenta alterar o status de uma transmissão para um estado que não é válido com base no estado atual.

**Solução**: 
- Para iniciar testes (`testing`), a transmissão deve estar no estado `ready` e vinculada a um stream válido
- Para ir ao vivo (`live`), a transmissão deve estar no estado `testing`
- Para finalizar (`complete`), a transmissão deve estar no estado `testing` ou `live`

```typescript
// Sequência correta de estados
// 1. Criar transmissão (estado: created)
// 2. Vincular a um stream (estado: ready)
// 3. Iniciar teste (estado: testing)
// 4. Ir ao vivo (estado: live)
// 5. Finalizar (estado: complete)
```

##### Erro: "Broadcast cannot be bound to a stream" (400)

Este erro ocorre quando você tenta vincular um stream a uma transmissão, mas o stream ou a transmissão não estão em um estado compatível.

**Solução**:
- Verifique se o stream está no estado `active` ou `ready`
- Verifique se a transmissão não está no estado `live` ou `complete`
- Crie um novo stream se o atual estiver em um estado incompatível

##### Erro: "Stream is already bound to another broadcast" (400)

Este erro ocorre quando você tenta vincular um stream que já está vinculado a outra transmissão.

**Solução**:
- Os streams não reutilizáveis só podem ser vinculados a uma transmissão por vez
- Use streams marcados como `isReusable: true` se precisar usar o mesmo stream em várias transmissões
- Desvincule o stream da transmissão anterior antes de vinculá-lo a uma nova

```typescript
// Criar um stream reutilizável
const stream = await action({
  title: "Stream Reutilizável",
  isReusable: true
}, req);
```

### Comentários Desativados em Vídeos

Quando um vídeo tem os comentários desabilitados, nossos loaders agora retornam corretamente uma resposta com `commentsDisabled: true` e um array vazio de itens, em vez de falhar com erro.

**Como usar**:
```typescript
// Carregando comentários com tratamento para comentários desabilitados
const comentarios = await loader({
  videoId: "ID_DO_VIDEO"
}, req);

if (comentarios?.commentsDisabled) {
  // Tratar caso de comentários desabilitados
  console.log("Comentários estão desabilitados para este vídeo");
} else if (comentarios?.items?.length > 0) {
  // Processar comentários normalmente
  console.log(`${comentarios.items.length} comentários encontrados`);
}
```

### Exclusão de Vídeos

A exclusão de vídeos no YouTube é permanente e não pode ser desfeita. A API retorna um código 204 (No Content) quando a operação é bem-sucedida.

**Observações importantes**:
- Apenas o proprietário do vídeo pode excluí-lo
- O escopo `https://www.googleapis.com/auth/youtube` ou `https://www.googleapis.com/auth/youtube.force-ssl` é obrigatório
- A exclusão é permanente e não pode ser desfeita
- Não é possível excluir vídeos em lote, apenas um por vez

**Erros comuns**:
- 403 Forbidden: Você não tem permissão para excluir este vídeo (não é o proprietário)
- 404 Not Found: O vídeo especificado não existe ou já foi excluído
- 401 Unauthorized: Token de acesso inválido ou expirado

**Casos de uso**:
- Remover vídeos privados ou não listados que não são mais necessários
- Gerenciar espaço na conta do YouTube 
- Remover vídeos que violam as diretrizes da plataforma
- Manter a organização do canal removendo conteúdo desatualizado

### Trabalhando com Legendas (Captions)

A API de legendas do YouTube funciona em duas etapas:
1. Primeiro, liste as legendas disponíveis para um vídeo
2. Em seguida, faça uma requisição específica para obter o texto completo da legenda

**Observações importantes**:
- O download de legendas requer autenticação, mesmo para vídeos públicos
- Diferentes formatos estão disponíveis: SRT (mais comum), SBV (formato YouTube) e VTT (para HTML5)
- As legendas podem ser em vários idiomas, verifique o campo `language` na resposta da listagem

**Exemplo completo**:
```typescript
// Listar legendas disponíveis
const legendasDisponiveis = await loader({
  videoId: "ID_DO_VIDEO"
}, req);

// Verificar se há legendas
if (!legendasDisponiveis || !legendasDisponiveis.items || legendasDisponiveis.items.length === 0) {
  console.log("Este vídeo não possui legendas");
  return;
}

// Exibir idiomas disponíveis
console.log("Legendas disponíveis:");
for (const legenda of legendasDisponiveis.items) {
  console.log(`- ${legenda.snippet.language} (${legenda.snippet.name}) - ID: ${legenda.id}`);
}

// Obter texto da legenda em português (se disponível)
const legendaPt = legendasDisponiveis.items.find(item => 
  item.snippet.language === "pt" || item.snippet.language === "pt-BR"
);

if (legendaPt) {
  // Obter texto completo da legenda
  const textoLegenda = await loader({
    captionId: legendaPt.id,
    format: "srt" // formatos disponíveis: "srt", "sbv", "vtt"
  }, req);
  
  console.log("Texto da legenda:", textoLegenda);
  
  // Para processar o formato SRT, você precisará de um parser
  // ou pode exibir o texto bruto conforme retornado pela API
}
```

- Operações como curtir comentários, definir status de moderação e outras ações sem conteúdo devem usar a abordagem de parâmetros na URL, não no corpo da requisição.

## Observações

- Para modificar informações do canal, você deve ser o proprietário do canal ou ter permissões adequadas.
- Para pinar comentários, você deve ser o proprietário do vídeo ou ter permissões adequadas.
- Para acessar dados de analytics, você precisa ter o escopo `yt-analytics.readonly` autorizado.
- Algumas operações exigem tokens de acesso com escopos específicos.
- A API do YouTube tem restrições específicas sobre quais partes podem ser atualizadas em conjunto. Por exemplo, `snippet` e `brandingSettings` devem ser atualizados em chamadas separadas.
- Operações como curtir comentários, definir status de moderação e outras ações sem conteúdo devem usar a abordagem de parâmetros na URL, não no corpo da requisição.
