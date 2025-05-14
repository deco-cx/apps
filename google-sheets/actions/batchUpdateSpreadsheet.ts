import { AppContext } from "../mod.ts";
import { BatchUpdateSpreadsheetRequest, Spreadsheet } from "../utils/types.ts";

export interface Props {
    /**
     * @title ID da Planilha
     * @description O ID da planilha do Google Sheets
     */
    spreadsheetId: string;

    /**
     * @title Solicitações
     * @description Lista de solicitações para serem executadas em lote na planilha
     */
    requests: unknown[];

    /**
     * @title Incluir Planilha na Resposta
     * @description Se a resposta deve incluir a planilha completa
     * @default false
     */
    includeSpreadsheetInResponse?: boolean;

    /**
     * @title Intervalos de Resposta
     * @description Lista de intervalos a serem incluídos na resposta
     */
    responseRanges?: string[];

    /**
     * @title Incluir Dados da Grade na Resposta
     * @description Se a resposta deve incluir os dados da grade
     * @default false
     */
    responseIncludeGridData?: boolean;

    /**
     * @title Token de Autenticação
     * @description O token de autenticação para acessar o Google Sheets
     */
    token: string;
}

/**
 * @title Atualizar Planilha em Lote
 * @description Executa múltiplas operações em uma planilha em uma única requisição
 */
const action = async (
    props: Props,
    _req: Request,
    _ctx: AppContext,
): Promise<{ spreadsheetId: string; updatedRanges?: string[] }> => {
    const {
        spreadsheetId,
        requests,
        includeSpreadsheetInResponse = false,
        responseRanges,
        responseIncludeGridData = false,
        token,
    } = props;

    try {
        // Preparando o corpo da requisição
        const body: BatchUpdateSpreadsheetRequest = {
            requests,
            includeSpreadsheetInResponse,
            responseRanges,
            responseIncludeGridData,
        };

        // Constrói a URL para a atualização em lote
        const url = new URL(
            `/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
            "https://sheets.googleapis.com",
        );

        // Faz a requisição para atualizar a planilha em lote
        const response = await fetch(url.toString(), {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
            }),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Erro ao atualizar planilha em lote: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        const responseData = await response.json();

        // Extrai os intervalos atualizados se disponíveis
        const updatedRanges = responseData.replies?.map((reply: any) => {
            if (reply.updateCells?.updatedRange) {
                return reply.updateCells.updatedRange;
            }
            return null;
        }).filter(Boolean);

        return {
            spreadsheetId,
            updatedRanges: updatedRanges?.length ? updatedRanges : undefined,
        };
    } catch (error) {
        console.error("Erro ao atualizar planilha em lote:", error);
        throw error;
    }
};

export default action; 