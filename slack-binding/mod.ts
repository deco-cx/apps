import { FnContext } from "@deco/deco";
import {
  InputBindingProps,
  OutputBindingProps,
  processStream,
} from "../mcp/bindings.ts";
import { McpContext } from "../mcp/context.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Payload {
  message: string;
  channel?: string;
  username?: string;
}

export interface SlackConfig {
  webhookUrl: string;
  defaultChannel?: string;
  defaultUsername?: string;
}

export type BindingHandler = (
  input: InputBindingProps<Payload> | OutputBindingProps,
) => Promise<void>;

export interface State {
  handle: (req: Request, ctx: AppContext) => BindingHandler;
}

export interface Props {
  slackConfig: SlackConfig;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

async function sendToSlack(
  webhookUrl: string,
  message: string,
  channel?: string,
  username?: string,
) {
  const payload = {
    text: message,
    ...(channel && { channel }),
    ...(username && { username }),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Erro ao enviar mensagem para o Slack:", response.statusText);
    } else {
      console.log("Mensagem enviada para o Slack com sucesso");
    }
  } catch (error) {
    console.error("Erro ao conectar com o Slack:", error);
  }
}

/**
 * @name SLACK_BINDING
 */
export default function App() {
  return {
    state: {
      handle: (_req: Request, ctx: AppContext) =>
        processStream<Payload>({
          mapPayloadToOptions: (payload) => {
            return {
              messages: [{
                id: crypto.randomUUID(),
                role: "user",
                content: `Mensagem do usuário: ${payload.message}`,
              }],
              options: {},
            };
          },
          onTextPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `📝 Texto: ${part.text}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onDataPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `📊 Dados: ${JSON.stringify(part)}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onFilePart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `📁 Arquivo: ${part.name || "arquivo"} (${part.mimeType || "tipo desconhecido"})`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onSourcePart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `🔗 Fonte: ${part.uri}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onErrorPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `❌ Erro: ${part.error}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onToolCallStreamingStartPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `🔧 Iniciando chamada de ferramenta: ${part.toolCallId}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onToolCallDeltaPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `🔄 Delta da ferramenta: ${part.toolCallId}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onFinishMessagePart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `✅ Mensagem finalizada: ${part.finishReason}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onReasoningPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `🧠 Raciocínio: ${part.reasoning}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onToolCallPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `🛠️ Chamada de ferramenta: ${part.toolName}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onToolResultPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `📋 Resultado da ferramenta: ${part.toolCallId}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onMessageAnnotationsPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `📝 Anotações da mensagem: ${JSON.stringify(part)}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onFinishStepPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `🏁 Etapa finalizada: ${part.finishReason}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onStartStepPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `🚀 Iniciando etapa: ${part.stepType}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onReasoningSignaturePart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `✍️ Assinatura do raciocínio: ${JSON.stringify(part)}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
          onRedactedReasoningPart: async (part) => {
            const { slackConfig } = ctx.props;
            await sendToSlack(
              slackConfig.webhookUrl,
              `🔒 Raciocínio censurado: ${part.reasoning}`,
              slackConfig.defaultChannel,
              slackConfig.defaultUsername,
            );
          },
        }),
    },
    manifest,
    dependencies: [],
  };
} 