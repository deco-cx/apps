# Discord Bot para Deco

Integração Discord Bot para envio de mensagens, gerenciamento de canais e moderação de servidores através da plataforma Deco.

## 🚀 Recursos Implementados

### Loaders Bot (Leitura de Dados)
- ✅ **listBotGuilds** - Listar servidores onde o bot está presente
- ✅ **getChannelMessages** - Buscar mensagens de um canal
- ✅ **getGuildChannels** - Listar canais de um servidor
- ✅ **getGuild** - Informações de um servidor
- ✅ **getGuildMembers** - Listar membros de um servidor
- ✅ **getGuildRoles** - Listar cargos de um servidor
- ✅ **getChannel** - Informações de um canal
- ✅ **getMessage** - Obter mensagem específica
- ✅ **getUser** - Informações de um usuário

### Actions Bot (Modificação de Dados)
- ✅ **sendMessage** - Enviar mensagens com embeds e replies
- ✅ **addReaction** - Adicionar reações a mensagens
- ✅ **editMessage** - Editar mensagens do bot
- ✅ **deleteMessage** - Deletar mensagens
- ✅ **createChannel** - Criar novos canais
- ✅ **banMember** - Banir membros do servidor
- ✅ **kickMember** - Expulsar membros do servidor
- ✅ **createInvite** - Criar convites para canais

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
  - Manage Messages
  - Manage Channels
  - Ban Members
  - Kick Members
  - Create Invite
  - Embed Links

### 3. Configuração no Deco

Configure o app com as seguintes propriedades:

```typescript
{
  "botToken": "SEU_BOT_TOKEN_AQUI"
}
```

## 💡 Exemplos de Uso

### 1. Enviar Mensagem Simples

```typescript
// Action: sendMessage
{
  "channelId": "123456789012345678",
  "content": "Olá! Esta é uma mensagem do bot 🤖"
}
```

### 2. Enviar Mensagem com Embed

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

### 3. Buscar Mensagens de um Canal

```typescript
// Loader: getChannelMessages
{
  "channelId": "123456789012345678",
  "limit": 10,
  "before": "987654321098765432"
}
```

### 4. Listar Canais de um Servidor

```typescript
// Loader: getGuildChannels
{
  "guildId": "123456789012345678"
}
```

### 5. Adicionar Reação

```typescript
// Action: addReaction
{
  "channelId": "123456789012345678",
  "messageId": "987654321098765432",
  "emoji": "👍"
}
```

### 6. Banir Membro

```typescript
// Action: banMember
{
  "guildId": "123456789012345678",
  "userId": "987654321098765432",
  "reason": "Violação das regras",
  "deleteMessageDays": 7
}
```

### 7. Listar Servidores do Bot

```typescript
// Loader: listBotGuilds
{
  "limit": 50,
  "withCounts": true
}
```

**Resposta:**
```typescript
[
  {
    "id": "123456789012345678",
    "name": "Meu Servidor",
    "icon": "a1b2c3d4e5f6g7h8i9j0",
    "owner": false,
    "permissions": "8",
    "features": ["COMMUNITY", "NEWS"],
    "approximate_member_count": 1250,
    "approximate_presence_count": 320
  }
]
```

## ⚡ Diferenças Bot vs OAuth

Este app utiliza **Bot Token**, não OAuth de usuário:

- ✅ **Bot**: Pode enviar mensagens e moderar servidores
- ✅ **Moderação**: Banir, expulsar, gerenciar canais
- ✅ **Mensagens**: Enviar, editar, deletar mensagens
- ✅ **Automação**: Ideal para bots automáticos

## 🔒 Permissões Necessárias

O bot precisa das seguintes permissões no servidor:

| Permissão | Função | Endpoints |
|-----------|---------|-----------|
| `Send Messages` | Enviar mensagens | `/channels/{id}/messages` |
| `Read Messages` | Ler mensagens | `/channels/{id}/messages` |
| `Manage Messages` | Gerenciar mensagens | `PATCH/DELETE /channels/{id}/messages` |
| `Add Reactions` | Adicionar reações | `/channels/{id}/messages/{id}/reactions` |
| `Manage Channels` | Gerenciar canais | `/guilds/{id}/channels` |
| `Ban Members` | Banir membros | `/guilds/{id}/bans` |
| `Kick Members` | Expulsar membros | `/guilds/{id}/members` |

## 🚨 Limitações

- **Requer Bot no Servidor** - O bot deve estar presente no servidor
- **Permissões Dependentes** - Precisa das permissões adequadas
- **Rate Limits** - Respeita limites da API Discord (5 msg/5s por canal)
- **Conteúdo Privado** - Não acessa DMs ou dados pessoais

## 🎯 Casos de Uso

- **Notificações Automáticas** - Alertas de sistema
- **Moderação** - Banir/expulsar usuários problemáticos  
- **Gerenciamento** - Criar canais automaticamente
- **Interação** - Responder a comandos e eventos
- **Logs** - Registrar atividades do servidor

Para funcionalidades de usuário OAuth, use o app `discord-user` separadamente.