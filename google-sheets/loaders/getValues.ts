import { AppContext } from "../mod.ts";
import { ValueRange } from "../utils/types.ts";
import { ensureValidToken } from "../utils/tokenManager.ts";

export interface Props {
  /**
   * @title ID da Planilha
   * @description O ID da planilha do Google Sheets
   */
  spreadsheetId: string;

  /**
   * @title Intervalo
   * @description O intervalo de células na notação A1 (ex: "Sheet1!A1:B10")
   */
  range: string;

  /**
   * @title Dimensão Principal
   * @description Determina a ordenação dos valores retornados
   * @default "ROWS"
   */
  majorDimension?: "ROWS" | "COLUMNS";

  /**
   * @title Opção de Renderização de Valores
   * @description Como os valores devem ser representados
   * @default "FORMATTED_VALUE"
   */
  valueRenderOption?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";

  /**
   * @title Opção de Renderização de Data/Hora
   * @description Como os valores de data e hora devem ser representados
   * @default "SERIAL_NUMBER"
   */
  dateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";
}

/**
 * @title Obter Valores
 * @description Lê os valores de células de uma planilha do Google Sheets
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ValueRange> => {
  const {
    spreadsheetId,
    range,
    majorDimension = "ROWS",
    valueRenderOption = "FORMATTED_VALUE",
    dateTimeRenderOption = "SERIAL_NUMBER",
  } = props;

  const isTokenValid = await ensureValidToken(ctx);

  if (!isTokenValid) {
    throw new Error(
      "Não foi possível obter um token válido. Autentique-se novamente.",
    );
  }

  // Construindo a URL com query parameters
  const rangeWithParams = `${
    encodeURIComponent(range)
  }?majorDimension=${majorDimension}&valueRenderOption=${valueRenderOption}&dateTimeRenderOption=${dateTimeRenderOption}`;

  try {
    const response = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId/values/:range"](
        {
          spreadsheetId,
          range: rangeWithParams,
        },
      );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao obter valores:", error);

    // Verificar se o erro está relacionado a token expirado
    if (
      error instanceof Error &&
      (error.message.includes("401") ||
        error.message.includes("invalid_token") ||
        error.message.includes("expired"))
    ) {
      // Tenta atualizar o token novamente no caso de falha específica de autenticação
      try {
        const isTokenRefreshed = await ensureValidToken(ctx);
        if (isTokenRefreshed) {
          // Token atualizado com sucesso, tenta a requisição novamente
          const rangeWithParams = `${
            encodeURIComponent(range)
          }?majorDimension=${majorDimension}&valueRenderOption=${valueRenderOption}&dateTimeRenderOption=${dateTimeRenderOption}`;

          const response = await ctx.client
            ["GET /v4/spreadsheets/:spreadsheetId/values/:range"](
              {
                spreadsheetId,
                range: rangeWithParams,
              },
            );

          const data = await response.json();
          return data;
        }
      } catch (refreshError) {
        console.error("Falha ao renovar token:", refreshError);
      }
    }

    throw error;
  }
};

export default loader;
