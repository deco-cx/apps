# Slack Binding MCP

Este projeto é um binding MCP (Model Context Protocol) para integração com o Slack, permitindo enviar notificações e mensagens para canais do Slack.

## Visão Geral

O `slack-binding` demonstra como implementar um binding personalizado que processa streams de entrada e saída usando o padrão MCP e envia as informações para o Slack através de webhooks. É projetado para ajudar você a entender como lidar com vários tipos de payloads e eventos de stream de forma modular e extensível.

## Como Funciona

- O binding recebe um payload (veja a interface `Payload` em `mod.ts`).
- Ele mapeia o payload para opções e lida com diferentes partes do stream (texto, dados, arquivo, fonte, erro, etc.) enviando-as para o Slack.
- Utiliza webhooks do Slack para enviar mensagens formatadas com emojis para melhor visualização.
- Suporta configuração de canal padrão e nome de usuário.

## Configuração

Para usar este binding, você precisa:

1. Criar um webhook no Slack:
   - Vá para https://api.slack.com/apps
   - Crie um novo app ou use um existente
   - Ative "Incoming Webhooks"
   - Crie um novo webhook para o canal desejado

2. Configurar as propriedades no seu app:
```typescript
{
  slackConfig: {
    webhookUrl: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    defaultChannel: "#general", // opcional
    defaultUsername: "Agent Bot" // opcional
  }
}
```

## Onde Procurar

- **mod.ts**: Veja `slack-binding/mod.ts` para um exemplo de caso de uso, mostrando como configurar handlers para diferentes partes do stream e como usar o binding.
- **actions/bindings/**: Contém os bindings de entrada e saída que processam as mensagens.

## Uso

Este exemplo é destinado a desenvolvedores que procuram entender ou estender bindings MCP com integração ao Slack. Você pode usá-lo como referência ou ponto de partida para seus próprios bindings.

## Funcionalidades

- ✅ Envio de mensagens de texto para o Slack
- ✅ Notificações de dados e arquivos
- ✅ Alertas de erro
- ✅ Notificações de chamadas de ferramentas
- ✅ Mensagens formatadas com emojis
- ✅ Configuração flexível de canal e usuário 