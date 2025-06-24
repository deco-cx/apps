import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Actor ID
   * @description The ID of the actor to run
   */
  actorId: string;

  /**
   * @title Input
   * @description Input data for the actor run (JSON object). If you don't know what object to pass, use an empty object: {}
   */
  input: {
    "profileUrls": string[];
  };

  /**
   * @title Timeout (seconds)
   * @description Maximum timeout for the run in seconds
   */
  timeout?: number;

  /**
   * @title Memory (MB)
   * @description Amount of memory allocated for the run in megabytes
   */
  memory?: number;

  /**
   * @title Build
   * @description Specific build version to use (optional)
   */
  build?: string;
}

/**
 * @title Run Actor Synchronously
 * @description Run an Apify actor synchronously and return dataset items
 */
export default async function runActor(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<any[] | { error: string }> {
  try {
    const { actorId, input, timeout, memory, build } = props;

    if (!actorId) {
      return { error: "Actor ID is required" };
    }

    console.log("Props received:", JSON.stringify(props, null, 2));
    console.log("Input value:", input);
    console.log("Input type:", typeof input);

    // Construir a URL com parâmetros de query usando o endpoint síncrono
    let url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`;
    const params = new URLSearchParams();
    if (timeout) params.append('timeout', timeout.toString());
    if (memory) params.append('memory', memory.toString());
    if (build) params.append('build', build);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // Preparar o body - agora o input é obrigatório
    console.log("Body to send:", JSON.stringify(input, null, 2));

    // Fazer a requisição POST diretamente com fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ctx.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Este endpoint retorna diretamente os itens do dataset
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error running actor:", error);
    return ctx.errorHandler.toHttpError(error, "Error running actor");
  }
} 