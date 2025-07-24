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
- `create.ts` - **Criar novo evento (com opção de Google Meet automático)** 🎥 (Atualizada)
- `decline.ts` - **Negar convite de evento** ✨ (Nova funcionalidade)
- `delete.ts` - Excluir evento completamente
- `move.ts` - Mover evento entre calendários
- `quickAdd.ts` - **Criar evento com texto natural (com opção de Google Meet automático)** 🎥 (Atualizada)
- `update.ts` - Atualizar evento existente

### Exemplo de Uso

```typescript
// Para criar um evento com Google Meet automático
await ctx.invoke["google-calendar"].actions.events.create({
  calendarId: "primary",
  event: {
    summary: "Reunião de Planejamento",
    start: { dateTime: "2024-01-15T14:00:00-03:00" },
    end: { dateTime: "2024-01-15T15:00:00-03:00" },
    attendees: [
      { email: "participante1@email.com" },
      { email: "participante2@email.com" }
    ]
  },
  addGoogleMeet: true // NOVO: Adiciona link do Google Meet automaticamente
});

// Para criar um evento rápido com Google Meet automático
await ctx.invoke["google-calendar"].actions.events.quickAdd({
  calendarId: "primary",
  text: "Reunião com cliente amanhã às 14h",
  addGoogleMeet: true, // NOVO: Adiciona link do Google Meet automaticamente
  sendNotifications: true
});

// Para criar um evento normal sem Google Meet
await ctx.invoke["google-calendar"].actions.events.create({
  calendarId: "primary",
  event: {
    summary: "Evento sem Meet",
    start: { dateTime: "2024-01-15T14:00:00-03:00" },
    end: { dateTime: "2024-01-15T15:00:00-03:00" }
  },
  addGoogleMeet: false // Ou omitir esta propriedade (default é false)
});

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