# Discord App para Deco

Integração completa com a API do Discord para automação, gerenciamento de servidores, canais e mensagens através da plataforma Deco.

## 🚀 Recursos Implementados

### Loaders (Leitura de Dados)
- ✅ **getChannelMessages** - Buscar mensagens de um canal com paginação
- ✅ **getMessage** - Obter uma mensagem específica por ID
- ✅ **getChannel** - Obter informações detalhadas de um canal

### Actions (Ações)
- ✅ **sendMessage** - Enviar mensagens com suporte a embeds e replies
- ✅ **addReaction** - Adicionar reações (emojis) a mensagens
- ✅ **editMessage** - Editar mensagens enviadas pelo bot

## 📋 Configuração

### 1. Criar Bot no Discord

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application" e dê um nome ao seu bot
3. Vá para a seção "Bot" e clique em "Add Bot"
4. Copie o **Bot Token** (será usado na configuração)
5. Em "Privileged Gateway Intents", habilite:
   - Message Content Intent
   - Server Members Intent (se precisar de informações de membros)

### 2. Configurar Permissões

Na seção "OAuth2 > URL Generator":
- **Scopes**: `bot`, `applications.commands`
- **Bot Permissions**:
  - Send Messages
  - Read Messages
  - Read Message History
  - Add Reactions
  - Use Slash Commands
  - Embed Links

### 3. Configuração no Deco

Configure o app com as seguintes propriedades:

```typescript
{
  "botToken": "SEU_BOT_TOKEN_AQUI",
  "clientId": "SEU_CLIENT_ID", // Opcional para OAuth
  "clientSecret": "SEU_CLIENT_SECRET" // Opcional para OAuth
}
```

## 💡 Exemplos de Uso

### 1. Buscar Mensagens de um Canal

```typescript
// Loader: getChannelMessages
{
  "channelId": "123456789012345678",
  "limit": 10,
  "before": "987654321098765432" // Opcional: mensagens antes desta
}
```

**Resposta:**
```typescript
[
  {
    "id": "123456789012345678",
    "content": "Olá mundo!",
    "author": {
      "id": "987654321098765432",
      "username": "usuario",
      "discriminator": "1234"
    },
    "timestamp": "2024-01-01T12:00:00Z",
    "channel_id": "123456789012345678"
  }
]
```

### 2. Enviar Mensagem Simples

```typescript
// Action: sendMessage
{
  "channelId": "123456789012345678",
  "content": "Olá! Esta é uma mensagem do bot 🤖"
}
```

### 3. Enviar Mensagem com Embed

```typescript
// Action: sendMessage
{
  "channelId": "123456789012345678",
  "content": "Confira este embed:",
  "embeds": [
    {
      "title": "Título do Embed",
      "description": "Descrição detalhada aqui",
      "color": 0x00ff00,
      "fields": [
        {
          "name": "Campo 1",
          "value": "Valor do campo",
          "inline": true
        }
      ],
      "footer": {
        "text": "Rodapé do embed"
      }
    }
  ]
}
```

### 4. Responder a uma Mensagem

```typescript
// Action: sendMessage
{
  "channelId": "123456789012345678",
  "content": "Esta é uma resposta!",
  "replyToMessageId": "987654321098765432",
  "replyMention": true // Menciona o autor da mensagem original
}
```

### 5. Adicionar Reação

```typescript
// Action: addReaction
{
  "channelId": "123456789012345678",
  "messageId": "987654321098765432",
  "emoji": "👍" // Ou emoji personalizado: "nome_emoji:id_emoji"
}
```

### 6. Editar Mensagem

```typescript
// Action: editMessage
{
  "channelId": "123456789012345678",
  "messageId": "987654321098765432",
  "content": "Mensagem editada! ✏️"
}
```

## 🎯 Casos de Uso Práticos

### Notificações Automáticas

```typescript
// Enviar notificação quando um pedido for processado
{
  "channelId": "canal_vendas",
  "embeds": [
    {
      "title": "🛍️ Novo Pedido",
      "description": "Pedido #1234 foi processado com sucesso",
      "color": 0x00ff00,
      "fields": [
        {"name": "Cliente", "value": "João Silva", "inline": true},
        {"name": "Valor", "value": "R$ 299,90", "inline": true},
        {"name": "Status", "value": "Pago", "inline": true}
      ],
      "timestamp": new Date().toISOString()
    }
  ]
}
```

### Sistema de Moderação

```typescript
// Buscar mensagens recentes para análise
{
  "channelId": "canal_geral",
  "limit": 50
}

// Adicionar reação de aprovação
{
  "channelId": "canal_geral",
  "messageId": "id_da_mensagem",
  "emoji": "✅"
}
```

### Bot de Suporte

```typescript
// Responder automaticamente a mensões
{
  "channelId": "canal_suporte",
  "content": "Olá! Recebi sua mensagem e vou analisar. Em breve retorno com uma resposta.",
  "replyToMessageId": "mensagem_do_usuario",
  "replyMention": true
}
```

## 🔧 Configurações Avançadas

### Rate Limiting
O app respeita automaticamente os limites de rate da API do Discord:
- 5 mensagens por 5 segundos por canal
- 50 requisições por segundo globalmente

### Tratamento de Erros
Todos os endpoints retornam errors estruturados:

```typescript
{
  "error": "Descrição do erro em português",
  "success": false // Para actions
}
```

### Tipos de Canal Discord
- **0**: Text Channel
- **1**: DM
- **2**: Voice Channel
- **4**: Category
- **5**: News Channel
- **10**: News Thread
- **11**: Public Thread
- **12**: Private Thread

## 🚨 Limitações e Considerações

1. **Permissões**: O bot precisa ter as permissões adequadas no servidor
2. **Rate Limits**: Respeite os limites da API para evitar bloqueios
3. **Mensagens**: Limite de 2000 caracteres por mensagem
4. **Embeds**: Máximo de 10 embeds por mensagem
5. **Reações**: Apenas o bot pode remover suas próprias reações

## 🔗 Links Úteis

- [Discord API Documentation](https://discord.com/developers/docs)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord Bot Permissions Calculator](https://discordapi.com/permissions.html)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique as permissões do bot
2. Confirme se os IDs estão corretos
3. Consulte os logs de erro do Deco
4. Teste com mensagens simples primeiro 