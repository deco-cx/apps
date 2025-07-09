# Google Calendar MCP App

Este app integra o Google Calendar com o MCP (Model Context Protocol), fornecendo ações para gerenciar eventos e convites.

## Diferença entre Negar Convite e Excluir Evento

### 🚫 Negar Convite (`decline.ts`)
- **O que faz:** Apenas marca sua resposta como "declined" no evento
- **Resultado:** O evento permanece no calendário, mas você aparece como "negou o convite"
- **Quando usar:** Quando você foi convidado para um evento e quer negar a participação sem remover o evento
- **API:** PATCH do evento, atualizando apenas o `responseStatus` do participante

### 🗑️ Excluir Evento (`delete.ts`)
- **O que faz:** Remove completamente o evento do calendário
- **Resultado:** O evento é excluído para todos os participantes
- **Quando usar:** Quando você quer cancelar/excluir o evento completamente
- **API:** DELETE do evento

## Ações Disponíveis

### Eventos
- `create.ts` - Criar novo evento
- `decline.ts` - **Negar convite de evento** ✨ (Nova funcionalidade)
- `delete.ts` - Excluir evento completamente
- `move.ts` - Mover evento entre calendários
- `quickAdd.ts` - Criar evento com texto natural
- `update.ts` - Atualizar evento existente

### Exemplo de Uso

```typescript
// Para negar um convite (mantém o evento, mas nega participação)
await ctx.invoke["google-calendar"].actions.events.decline({
  calendarId: "primary",
  eventId: "evento123",
  comment: "Não conseguirei comparecer devido a conflito de agenda"
});

// Para excluir completamente um evento
await ctx.invoke["google-calendar"].actions.events.delete({
  calendarId: "primary", 
  eventId: "evento123",
  sendNotifications: true
});
```

## Configuração OAuth

Este app requer configuração OAuth 2.0 com o Google Calendar API. Certifique-se de ter:

1. Client ID do Google Cloud Console
2. Client Secret do Google Cloud Console  
3. Redirect URI configurada
4. Escopos necessários: `https://www.googleapis.com/auth/calendar` 