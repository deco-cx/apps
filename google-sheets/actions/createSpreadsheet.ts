import { AppContext } from "../mod.ts";
import { Spreadsheet } from "../utils/types.ts";

export interface Props {
    /**
     * @title Título da Planilha
     * @description O título para a nova planilha
     */
    title: string;

    /**
     * @title Locale
     * @description O código de localização para a planilha
     * @default "pt_BR"
     */
    locale?: string;

    /**
     * @title Fuso Horário
     * @description O fuso horário da planilha
     * @default "America/Sao_Paulo"
     */
    timeZone?: string;

    /**
     * @title Auto Recalcular
     * @description Quando as fórmulas devem ser recalculadas
     * @default "ON_CHANGE"
     */
    autoRecalc?: "ON_CHANGE" | "MINUTE" | "HOUR";

    /**
     * @title Folhas Iniciais
     * @description Configuração das folhas iniciais da planilha
     */
    sheets?: Array<{
        /**
         * @title Título da Folha
         * @description Título da folha a ser criada
         */
        title: string;

        /**
         * @title Número de Linhas
         * @description Número de linhas na folha
         * @default 1000
         */
        rowCount?: number;

        /**
         * @title Número de Colunas
         * @description Número de colunas na folha
         * @default 26
         */
        columnCount?: number;
    }>;
}

/**
 * @title Criar Planilha
 * @description Cria uma nova planilha no Google Sheets
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<Spreadsheet> => {
    const {
        title,
        locale = "pt_BR",
        timeZone = "America/Sao_Paulo",
        autoRecalc = "ON_CHANGE",
        sheets = [{ title: "Sheet1", rowCount: 1000, columnCount: 26 }],
    } = props;

    try {
        // Preparando o corpo da requisição
        const body = {
            properties: {
                title,
                locale,
                timeZone,
                autoRecalc,
            },
            sheets: sheets.map(sheet => ({
                properties: {
                    title: sheet.title,
                    gridProperties: {
                        rowCount: sheet.rowCount || 1000,
                        columnCount: sheet.columnCount || 26,
                    },
                },
            })),
        };

        // Adiciona o API Key se estiver disponível
        const searchParams = new URLSearchParams();
        if (ctx.apiKey) {
            searchParams.append("key", ctx.apiKey);
        }

        // Constrói a URL para criar a planilha
        const url = new URL("/v4/spreadsheets", "https://sheets.googleapis.com");
        for (const [key, value] of searchParams.entries()) {
            url.searchParams.append(key, value);
        }

        // Se não tiver token de acesso OAuth, não pode criar planilhas com apenas API Key
        if (!ctx.accessToken) {
            throw new Error("Token de acesso OAuth necessário para criar planilhas");
        }

        // Faz a requisição para criar a planilha
        const response = await fetch(url.toString(), {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ctx.accessToken}`,
            }),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao criar planilha: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Erro ao criar planilha:", error);
        throw error;
    }
};

export default action; 