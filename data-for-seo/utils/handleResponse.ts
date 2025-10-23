import { HttpError } from "../../utils/http.ts";

export async function handleDataForSeoResponse(
  response: Response,
  toolName: string,
) {
  let data;

  try {
    data = await response.json();
  } catch (error) {
    // Se não conseguiu fazer parse do JSON
    throw new HttpError(
      500,
      JSON.stringify({
        status: "error",
        message:
          `❌ Erro ao processar resposta de ${toolName}. A API não retornou um JSON válido.`,
        details: error instanceof Error ? error.message : "Erro desconhecido",
      }),
    );
  }

  // Verifica se data é null ou undefined
  if (!data) {
    throw new HttpError(
      500,
      JSON.stringify({
        status: "error",
        message:
          `❌ API retornou resposta vazia para ${toolName}. Tente novamente ou verifique se os parâmetros estão corretos.`,
        response_was_null: true,
      }),
    );
  }

  // Success
  if (data.status_code === 20000) {
    // Verifica se tem dados válidos nos tasks
    if (data.tasks && data.tasks.length > 0) {
      const task = data.tasks[0];

      // Se é um GET result e retornou null no result
      if (task.result === null && task.status_message === "Task In Queue") {
        throw new HttpError(
          202,
          JSON.stringify({
            status: "processing",
            message:
              `⏳ Tarefa de ${toolName} ainda está sendo processada. Por favor, aguarde mais alguns segundos e tente novamente.`,
            retry_after: 5,
            task_id: task.id,
          }),
        );
      }

      // Se tem result mas está vazio
      if (task.result && task.result.length === 0) {
        return {
          status: "success",
          message:
            `✅ Consulta concluída para ${toolName}, mas não foram encontrados dados.`,
          empty_result: true,
          data: data,
        };
      }
    }

    return data;
  }

  const statusMessage = data.status_message || "Erro desconhecido da API.";
  const statusCode = data.status_code;

  switch (statusCode) {
    case 40602: // Task In Queue
      throw new HttpError(
        202,
        JSON.stringify({
          status: "processing",
          message:
            `⏳ Tarefa de ${toolName} está sendo processada. Por favor, aguarde alguns segundos e tente novamente.`,
          retry_after: 3,
        }),
      );

    case 40501: // Invalid Field
      if (statusMessage.includes("'location_name'")) {
        throw new HttpError(
          400,
          JSON.stringify({
            status: "error",
            message:
              `❌ Campo inválido: 'location_name'. 💡 Dica: Use 'location_code' ao invés de 'location_name'. Exemplos: 🇺🇸 United States = 2840, 🇧🇷 Brazil = 2076, 🇬🇧 United Kingdom = 2826, 🇵🇹 Portugal = 2620.`,
          }),
        );
      }
      throw new HttpError(
        400,
        JSON.stringify({
          status: "error",
          message:
            `❌ Erro de campo inválido na API ${toolName}: ${statusMessage}`,
        }),
      );

    case 40402: // Invalid Path
      throw new HttpError(
        501,
        JSON.stringify({
          status: "error",
          message:
            `❌ Endpoint de ${toolName} não disponível. Este recurso pode ter sido descontinuado ou requer assinatura especial.`,
        }),
      );

    case 40204: // Access denied
      throw new HttpError(
        403,
        JSON.stringify({
          status: "error",
          message:
            `🔒 Acesso negado para ${toolName}. Este recurso requer assinatura ativa. Visite: https://app.dataforseo.com/backlinks-subscription`,
        }),
      );

    case 40100: // Unauthorized
      throw new HttpError(
        401,
        JSON.stringify({
          status: "error",
          message:
            `🔒 Não autorizado para ${toolName}. Verifique suas credenciais de API em https://app.dataforseo.com/api-access.`,
        }),
      );

    case 40106: // Rate limit exceeded
      throw new HttpError(
        429,
        JSON.stringify({
          status: "error",
          message:
            `⏱️ Limite de requisições excedido para ${toolName}. Aguarde alguns minutos antes de tentar novamente.`,
        }),
      );

    case 40601: // Task not found
      throw new HttpError(
        404,
        JSON.stringify({
          status: "error",
          message:
            `❌ Task não encontrada para ${toolName}. Verifique se o task_id está correto ou se a task não expirou.`,
        }),
      );

    default:
      throw new HttpError(
        response.status || 500,
        JSON.stringify({
          status: "error",
          message:
            `🚨 Erro inesperado da API ${toolName}: ${statusMessage} (Código: ${statusCode})`,
          status_code: statusCode,
          status_message: statusMessage,
        }),
      );
  }
}

// Função específica para actions que criam tasks
export async function handleTaskCreationResponse(
  response: Response,
  taskType: string,
) {
  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new HttpError(
      500,
      JSON.stringify({
        status: "error",
        message:
          `❌ Erro ao criar task de ${taskType}. A API não retornou um JSON válido.`,
        details: error instanceof Error ? error.message : "Erro desconhecido",
      }),
    );
  }

  // Verifica se data é null
  if (!data) {
    throw new HttpError(
      500,
      JSON.stringify({
        status: "error",
        message: `❌ API retornou resposta vazia ao criar task de ${taskType}.`,
        response_was_null: true,
      }),
    );
  }

  if (data.status_code === 20000) {
    const taskInfo = data.tasks?.[0];
    if (taskInfo) {
      return {
        status: "success",
        message: `✅ Task de ${taskType} criada com sucesso!`,
        task_id: taskInfo.id,
        cost: taskInfo.cost,
        status_code: taskInfo.status_code,
        path: taskInfo.path,
        data: taskInfo.data,
        result_url: taskInfo.result_url,
        instructions:
          `⏱️ Aguarde 3-5 segundos e use o loader correspondente com o task_id: ${taskInfo.id}`,
      };
    }

    // Se não tem task info
    throw new HttpError(
      500,
      JSON.stringify({
        status: "error",
        message:
          `❌ Task de ${taskType} foi criada mas não retornou informações da task.`,
        raw_response: data,
      }),
    );
  }

  // Se não foi sucesso, usa o handler padrão
  return handleDataForSeoResponse(response, taskType);
}
