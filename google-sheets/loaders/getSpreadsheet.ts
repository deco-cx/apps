import { AppContext } from "../mod.ts";
import { Spreadsheet } from "../utils/types.ts";

export interface Props {
    /**
     * @title ID da Planilha
     * @description O ID da planilha do Google Sheets a ser obtida
     */
    spreadsheetId: string;
}

/**
 * @title Obter Planilha
 * @description Obtém os metadados de uma planilha do Google Sheets
 */
const loader = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<Spreadsheet> => {
    const { spreadsheetId } = props;

    try {
        // Adiciona o API Key se estiver disponível
        const searchParams = new URLSearchParams();
        if (ctx.apiKey) {
            searchParams.append("key", ctx.apiKey);
        }

        // Constrói a URL com os parâmetros de pesquisa
        const url = new URL(`/v4/spreadsheets/${spreadsheetId}`, "https://sheets.googleapis.com");
        for (const [key, value] of searchParams.entries()) {
            url.searchParams.append(key, value);
        }

        // Faz a requisição diretamente se estiver usando API Key 
        // ou se o token de acesso não estiver disponível
        if (ctx.apiKey && !ctx.accessToken) {
            const response = await fetch(url.toString());

            if (!response.ok) {
                throw new Error(`Erro ao obter planilha: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        }

        // Usa o cliente HTTP configurado com token de acesso
        const response = await ctx.api["GET /v4/spreadsheets/:spreadsheetId"]({
            spreadsheetId,
        });

        if (!response.ok) {
            throw new Error(`Erro ao obter planilha: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Erro ao obter planilha:", error);
        throw error;
    }
};

export default loader; 