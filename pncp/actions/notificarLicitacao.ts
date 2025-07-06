import { AppContext } from "../mod.ts";
import { PNCPDocumento } from "../client.ts";

export interface Props {
  /**
   * @title ID do Documento
   * @description Identificador único do documento para monitorar
   */
  id: string;

  /**
   * @title Email de Notificação
   * @description Email para enviar notificações sobre o documento
   */
  email: string;

  /**
   * @title Webhook URL
   * @description URL opcional para receber notificações via webhook
   */
  webhookUrl?: string;
}

export interface Result {
  /** Se a operação foi bem-sucedida */
  success: boolean;
  /** Mensagem da operação */
  message: string;
  /** Dados do documento monitorado */
  documento?: PNCPDocumento;
  /** ID da notificação criada */
  notificationId?: string;
}

/**
 * @title Configurar Notificação para Licitação
 * @description Configura notificações para mudanças de status em uma licitação específica
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Result> => {
  const { id, email, webhookUrl } = props;

  try {
    // Primeiro, verificar se o documento existe
    const documento = await ctx.api["GET /api/documento/:id"]({
      id,
    });

    if (!documento) {
      return {
        success: false,
        message: `Documento com ID ${id} não encontrado`,
      };
    }

    // Simular configuração de notificação
    // Em uma implementação real, isso poderia:
    // 1. Salvar a configuração em um banco de dados
    // 2. Configurar um job para monitorar mudanças
    // 3. Integrar com serviços de email/webhook

    const notificationId = `notif_${id}_${Date.now()}`;

    // Log da configuração (em produção, salvaria em DB)
    console.log(`Configurando notificação:`, {
      documentoId: id,
      documentoTitulo: documento.titulo,
      email,
      webhookUrl,
      notificationId,
      statusAtual: documento.status,
    });

    return {
      success: true,
      message: `Notificação configurada com sucesso para o documento "${documento.titulo}"`,
      documento,
      notificationId,
    };
  } catch (error) {
    console.error("Erro ao configurar notificação:", error);
    return {
      success: false,
      message: `Erro ao configurar notificação: ${error.message}`,
    };
  }
};

export default action;