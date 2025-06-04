import { AppContext } from "../mod.ts";
import { GOOGLE_SHEETS_URL, TEMP_QUERY_SHEET_NAME } from "../utils/constant.ts";
import { CellValue, ValueRange } from "../utils/types.ts";
import { SheetsQueryBuilder } from "../utils/queryBulder.ts";
import { logger } from "@deco/deco/o11y";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description O ID da planilha do Google Sheets
   */
  spreadsheetId: string;

  /**
   * @title Nome da Planilha
   * @description Nome da aba da planilha que contém os dados
   */
  sheet: string;

  /**
   * @title Intervalo
   * @description Intervalo de células a ser consultado (ex: A1:Z100)
   */
  range?: string;

  /**
   * @title Adicionar Número da Linha
   * @description Se deve adicionar o número da linha original aos resultados
   */
  addRowNumber?: boolean;

  /**
   * @title Colunas
   * @description Lista de colunas a serem selecionadas (ex: ["A", "B", "C"] ou ["Nome", "Sobrenome"])
   */
  select?: string[];

  /**
   * @title Termo de Busca
   * @description Termo para buscar em várias colunas
   */
  searchTerm?: string;

  /**
   * @title Colunas de Busca
   * @description Lista de colunas onde buscar o termo (pode ser letras "A", "B" ou nomes "Nome", "Sobrenome")
   */
  searchColumns?: string[];

  /**
   * @title Número da Linha do Cabeçalho
   * @description Número da linha que contém o cabeçalho (padrão: 1)
   */
  headerRow?: number;

  /**
   * @title Major Dimension
   * @description Como organizar os valores na matriz (por linhas ou colunas)
   */
  majorDimension?: "ROWS" | "COLUMNS";

  /**
   * @title Value Render Option
   * @description Como os valores devem ser representados na resposta
   */
  valueRenderOption?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";

  /**
   * @title Date Time Render Option
   * @description Como datas e horas devem ser representadas na resposta
   */
  dateTimeRenderOption?: "FORMATTED_STRING" | "SERIAL_NUMBER";

  /**
   * @title Modo Debug
   * @description Quando ativado, não apaga as abas temporárias para facilitar a depuração
   */
  debugMode?: boolean;
}

// Definir uma interface para as abas da planilha
interface Sheet {
  properties?: {
    title?: string;
    sheetId?: number;
  };
}

/**
 * Cria uma aba temporária para a consulta
 */
async function createTempQuerySheet(
  ctx: AppContext,
  spreadsheetId: string,
  queryFormula: string,
  debugMode = false,
): Promise<string> {
  try {
    // Gerar um nome de aba temporária único se estiver em modo debug
    const sheetName = debugMode
      ? `${TEMP_QUERY_SHEET_NAME}_${Math.floor(Math.random() * 1000000)}`
      : TEMP_QUERY_SHEET_NAME;

    logger.info("Criando aba temporária para consulta", { sheetName });

    const addSheetReq = {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    };

    const batchUpdateUrl =
      `${GOOGLE_SHEETS_URL}/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const accessToken = ctx.tokens?.access_token;

    if (!accessToken) {
      logger.error("Token de acesso não disponível");
      throw new Error("Token de acesso não disponível");
    }

    logger.info("Enviando requisição para criar aba temporária");
    const addSheetResponse = await fetch(batchUpdateUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addSheetReq),
    });

    if (!addSheetResponse.ok) {
      const errorText = await addSheetResponse.text();
      logger.error("Erro ao criar planilha temporária", {
        status: addSheetResponse.status,
        statusText: addSheetResponse.statusText,
        errorText,
        requestBody: addSheetReq,
      });
      throw new Error(
        `Erro ao criar planilha temporária: ${addSheetResponse.statusText}. Detalhes: ${errorText}`,
      );
    }

    const addSheetResult = await addSheetResponse.json();
    logger.info("Aba temporária criada com sucesso", {
      sheetName,
      addSheetResult,
    });

    // Adicionar a fórmula QUERY à primeira célula da aba temporária
    const updateFormulaBody = {
      range: `${sheetName}!A1`,
      majorDimension: "ROWS",
      values: [[queryFormula]],
    };

    logger.info("Adicionando fórmula QUERY à aba temporária", {
      formula: queryFormula.substring(0, 100) +
        (queryFormula.length > 100 ? "..." : ""),
    });

    const updateFormulaResponse = await ctx.client
      ["PUT /v4/spreadsheets/:spreadsheetId/values/:range"](
        {
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: "USER_ENTERED",
        },
        { body: updateFormulaBody },
      );

    if (!updateFormulaResponse.ok) {
      const errorText = await updateFormulaResponse.text();
      logger.error("Erro ao adicionar fórmula QUERY", {
        status: updateFormulaResponse.status,
        statusText: updateFormulaResponse.statusText,
        errorText,
      });
      throw new Error(
        `Erro ao adicionar fórmula QUERY: ${updateFormulaResponse.statusText}. Detalhes: ${errorText}`,
      );
    }

    const updateResult = await updateFormulaResponse.json();
    logger.info("Fórmula QUERY adicionada com sucesso", { updateResult });

    return sheetName;
  } catch (error) {
    logger.error("Erro durante criação da aba temporária para consulta", {
      error,
    });
    throw error;
  }
}

/**
 * Deleta uma aba temporária
 */
async function deleteTempSheet(
  ctx: AppContext,
  spreadsheetId: string,
  sheetName: string,
  debugMode = false,
): Promise<void> {
  try {
    // Se estiver em modo debug, não apaga a aba
    if (debugMode) {
      logger.info(`Modo debug ativado - a aba ${sheetName} não será excluída`);
      return;
    }

    logger.info(`Preparando para excluir a aba ${sheetName}`);

    const spreadsheetResponse = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId"]({
        spreadsheetId,
      });

    if (!spreadsheetResponse.ok) {
      const errorText = await spreadsheetResponse.text();
      logger.error(
        "Erro ao obter informações da planilha para exclusão da aba",
        {
          status: spreadsheetResponse.status,
          statusText: spreadsheetResponse.statusText,
          errorText,
        },
      );
      return; // Retorna silenciosamente sem falhar o processo
    }

    const spreadsheet = await spreadsheetResponse.json();

    // Primeiro tentar encontrar pelo nome exato
    let tempSheet = spreadsheet.sheets?.find(
      (sheet: Sheet) =>
        sheet &&
        sheet.properties &&
        sheet.properties.title === sheetName,
    );

    // Se não encontrar e o nome não terminar com " (Cópia)", tentar encontrar uma aba
    // que contenha o nome + " (Cópia)" - isso é útil quando o nome esperado não inclui o sufixo
    if (!tempSheet && !sheetName.endsWith(" (Cópia)")) {
      const copyName = `${sheetName} (Cópia)`;
      logger.info(
        `Aba ${sheetName} não encontrada, tentando com sufixo: ${copyName}`,
      );

      tempSheet = spreadsheet.sheets?.find(
        (sheet: Sheet) =>
          sheet &&
          sheet.properties &&
          sheet.properties.title === copyName,
      );

      if (tempSheet) {
        logger.info(`Encontrada aba com sufixo: ${copyName}`);
        sheetName = copyName; // Atualizar o nome para a exclusão correta
      }
    }

    if (!tempSheet || !tempSheet.properties?.sheetId) {
      logger.warn(`Aba ${sheetName} não encontrada para exclusão`);
      return;
    }

    logger.info(`Aba ${sheetName} encontrada, preparando exclusão`, {
      sheetId: tempSheet.properties.sheetId,
    });

    const deleteSheetReq = {
      requests: [
        {
          deleteSheet: {
            sheetId: tempSheet.properties.sheetId,
          },
        },
      ],
    };

    const batchUpdateUrl =
      `${GOOGLE_SHEETS_URL}/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const accessToken = ctx.tokens?.access_token;

    if (!accessToken) {
      logger.error("Token de acesso não disponível para exclusão da aba");
      return; // Retorna silenciosamente sem falhar o processo
    }

    logger.info(`Enviando requisição para excluir a aba ${sheetName}`);
    const deleteResponse = await fetch(batchUpdateUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deleteSheetReq),
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      logger.error(`Erro ao excluir a aba ${sheetName}`, {
        status: deleteResponse.status,
        statusText: deleteResponse.statusText,
        errorText,
      });
      return; // Retorna silenciosamente sem falhar o processo
    }

    logger.info(`Aba ${sheetName} excluída com sucesso`);
  } catch (error) {
    // Captura e loga o erro, mas não propaga para não afetar o fluxo principal
    logger.error(`Erro ao tentar excluir a aba ${sheetName}`, { error });
  }
}

/**
 * Cria uma cópia da aba original para trabalhar sem modificar os dados do usuário
 */
async function createSheetCopy(
  ctx: AppContext,
  spreadsheetId: string,
  sourceSheetName: string,
  _debugMode = false,
): Promise<string> {
  try {
    logger.info("Obtendo informações da planilha", {
      spreadsheetId,
      sourceSheetName,
    });

    // Primeiro, precisamos obter o ID da aba de origem
    const spreadsheetResponse = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId"]({
        spreadsheetId,
      });

    if (!spreadsheetResponse.ok) {
      const errorText = await spreadsheetResponse.text();
      logger.error("Erro ao acessar planilha", {
        status: spreadsheetResponse.status,
        statusText: spreadsheetResponse.statusText,
        errorText,
      });
      throw new Error(
        `Erro ao acessar planilha: ${spreadsheetResponse.statusText}. Detalhes: ${errorText}`,
      );
    }

    const spreadsheet = await spreadsheetResponse.json();
    logger.info("Planilha obtida com sucesso", {
      title: spreadsheet.properties?.title,
      sheetCount: spreadsheet.sheets?.length || 0,
    });

    if (
      !spreadsheet.sheets || !Array.isArray(spreadsheet.sheets) ||
      spreadsheet.sheets.length === 0
    ) {
      logger.error("Planilha não contém abas", { spreadsheet });
      throw new Error("A planilha não contém nenhuma aba");
    }

    // Verificar se a aba de origem existe
    const sourceSheet = spreadsheet.sheets.find(
      (sheet: Sheet) =>
        sheet &&
        sheet.properties &&
        sheet.properties.title === sourceSheetName,
    );

    if (!sourceSheet || !sourceSheet.properties?.sheetId) {
      const availableSheets = spreadsheet.sheets
        .map((s: Sheet) => s.properties?.title)
        .filter(Boolean)
        .join(", ");

      logger.error("Aba de origem não encontrada", {
        sourceSheetName,
        availableSheets,
      });

      throw new Error(
        `Aba de origem "${sourceSheetName}" não encontrada. Abas disponíveis: ${availableSheets}`,
      );
    }

    logger.info("Aba de origem encontrada", {
      sourceSheetId: sourceSheet.properties.sheetId,
      title: sourceSheet.properties.title,
    });

    // O nome esperado da cópia será o nome original + " (Cópia)"
    const expectedCopyName = `${sourceSheetName} (Cópia)`;
    logger.info("Nome esperado da cópia", { expectedCopyName });

    // Usar a API correta para copiar a aba dentro da mesma planilha
    const copyToUrl =
      `${GOOGLE_SHEETS_URL}/v4/spreadsheets/${spreadsheetId}/sheets/${sourceSheet.properties.sheetId}:copyTo`;
    const accessToken = ctx.tokens?.access_token;

    if (!accessToken) {
      logger.error("Token de acesso não disponível");
      throw new Error("Token de acesso não disponível");
    }

    logger.info("Iniciando cópia da aba", {
      sourceSheetId: sourceSheet.properties.sheetId,
      destinationSpreadsheetId: spreadsheetId,
    });

    // Fazer a cópia para a mesma planilha (mesmo spreadsheetId)
    const copySheetResponse = await fetch(copyToUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destinationSpreadsheetId: spreadsheetId,
      }),
    });

    // Verificar se a cópia foi bem-sucedida
    if (!copySheetResponse.ok) {
      const errorText = await copySheetResponse.text();
      logger.error("Erro ao criar cópia da aba", {
        status: copySheetResponse.status,
        statusText: copySheetResponse.statusText,
        errorText,
      });

      throw new Error(
        `Erro ao criar cópia da aba: ${copySheetResponse.statusText}. Detalhes: ${errorText}`,
      );
    }

    const copyResponse = await copySheetResponse.json();
    logger.info("Resposta da operação de cópia", copyResponse);

    // Buscar a planilha atualizada para encontrar a aba recém-copiada
    const updatedSpreadsheetResponse = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId"]({
        spreadsheetId,
      });

    if (!updatedSpreadsheetResponse.ok) {
      logger.warn(
        "Não foi possível verificar a cópia criada, assumindo nome padrão",
        { expectedCopyName },
      );
      return expectedCopyName;
    }

    const updatedSpreadsheet = await updatedSpreadsheetResponse.json();
    if (
      !updatedSpreadsheet.sheets || !Array.isArray(updatedSpreadsheet.sheets)
    ) {
      logger.warn("Não foi possível encontrar abas na planilha atualizada", {
        expectedCopyName,
      });
      return expectedCopyName;
    }

    const copySheet = updatedSpreadsheet.sheets.find(
      (sheet: Sheet) =>
        sheet &&
        sheet.properties &&
        sheet.properties.title === expectedCopyName,
    );

    if (!copySheet || !copySheet.properties || !copySheet.properties.sheetId) {
      logger.warn(
        "Não foi possível encontrar a cópia pelo nome esperado, assumindo nome padrão",
        { expectedCopyName },
      );
      return expectedCopyName;
    }

    logger.info("Cópia da aba encontrada", {
      copyName: copySheet.properties.title,
      sheetId: copySheet.properties.sheetId,
    });

    return expectedCopyName;
  } catch (error) {
    logger.error("Erro durante criação da cópia da aba", { error });
    throw error;
  }
}

/**
 * Encontra a primeira coluna vazia em uma planilha
 */
async function findFirstEmptyColumn(
  ctx: AppContext,
  spreadsheetId: string,
  sheetName: string,
): Promise<string> {
  // Buscar os dados da primeira linha para verificar quais colunas estão ocupadas
  const response = await ctx.client
    ["GET /v4/spreadsheets/:spreadsheetId/values/:range"]({
      spreadsheetId,
      range: `${sheetName}!A1:ZZ1`,
    });

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados da planilha: ${response.statusText}`);
  }

  const data = await response.json();

  // Se não houver valores, a primeira coluna está vazia
  if (!data.values || !data.values[0]) {
    return "A";
  }

  // A primeira coluna vazia será o comprimento do array + 1 (em letra)
  const nextColumnIndex = data.values[0].length;

  // Converter o índice para letra de coluna (0=A, 1=B, etc)
  return indexToColumnLetter(nextColumnIndex);
}

/**
 * Converte um índice para letra de coluna
 */
function indexToColumnLetter(index: number): string {
  let letter = "";
  let num = index;

  do {
    const mod = num % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);

  return letter;
}

/**
 * Adiciona uma fórmula para numerar as linhas em uma coluna vazia
 */
async function addRowNumbersFormula(
  ctx: AppContext,
  spreadsheetId: string,
  sheetName: string,
): Promise<{ column: string; range: string }> {
  // Encontrar a primeira coluna vazia
  const column = await findFirstEmptyColumn(ctx, spreadsheetId, sheetName);
  const range = `${sheetName}!${column}1`;

  // Fórmula para numerar as linhas (começando da segunda linha)
  const formula = '=ARRAYFORMULA(IF(LEN(A2:A); ROW(A2:A) - ROW(A2) + 1; ""))';

  // Adicionar a fórmula na célula
  const updateResponse = await ctx.client
    ["PUT /v4/spreadsheets/:spreadsheetId/values/:range"](
      {
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
      },
      {
        body: {
          range,
          majorDimension: "ROWS",
          values: [[formula]],
        },
      },
    );

  if (!updateResponse.ok) {
    throw new Error(
      `Erro ao adicionar fórmula de numeração: ${updateResponse.statusText}`,
    );
  }

  return { column, range };
}

function headersMap(headers: CellValue[][]) {
  const labels: Record<string, string> = {};
  const headerMap = new Map<string, number>();

  // Garantir que temos pelo menos uma linha
  if (headers && headers.length > 0) {
    // Pegar apenas a primeira linha como cabeçalho
    const headerRow = headers[0];

    // Processar cada célula da linha de cabeçalho
    headerRow.forEach((cell: CellValue, index: number) => {
      if (cell) {
        const colNum = index + 1;
        const headerName = String(cell);
        labels[`Col${colNum}`] = headerName;
        headerMap.set(headerName, index);
      }
    });
  }

  return { labels, headerMap };
}

/**
 * @name QUERY_SPREADSHEET_DATA
 * @title Consultar Dados com QUERY
 * @description Consulta dados em uma planilha usando a fórmula QUERY do Google Sheets
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ValueRange> => {
  logger.info("init query loader");
  const {
    spreadsheetId,
    sheet,
    range = "A:Z",
    addRowNumber = true,
    select,
    searchTerm,
    searchColumns,
    headerRow = 1,
    majorDimension = "ROWS",
    valueRenderOption = "FORMATTED_VALUE",
    dateTimeRenderOption = "SERIAL_NUMBER",
    debugMode = true,
  } = props;

  // Tentar criar cópia da aba original para trabalhar sem modificar os dados do usuário
  let copySheetName = "";
  let useOriginalSheet = false;

  try {
    logger.info("creating sheet copy");
    copySheetName = await createSheetCopy(ctx, spreadsheetId, sheet, debugMode);
    logger.info("sheet copy created", { copySheetName });
  } catch (error) {
    // Se falhar a criação da cópia, usamos a planilha original com um alerta
    logger.warn("Falha ao criar cópia da aba, usando a original", { error });
    copySheetName = sheet;
    useOriginalSheet = true;
  }

  let tempSheetName = "";

  try {
    // Pegar os headers primeiro para usar como labels
    const headersResponse = await ctx.client
      ["GET /v4/spreadsheets/:spreadsheetId/values/:range"]({
        spreadsheetId,
        range: `${copySheetName}!${range.split(":")[0]}1:${
          range.split(":")[1].replace(/[0-9]/g, "")
        }1`,
        majorDimension,
        valueRenderOption,
      }).then((res) => {
        if (res.ok) {
          return res.json();
        }
        return null;
      });

    const { labels, headerMap } = headersMap(headersResponse?.values || []);

    logger.info("init query builder");
    const queryBuilder = new SheetsQueryBuilder();

    console.log("range", { sheet: copySheetName, range });
    queryBuilder.range(copySheetName, range);
    queryBuilder.header(headerRow);
    queryBuilder.headerMap(headerMap);

    // Adicionar fórmula para numerar linhas na cópia da planilha, mas NUNCA na original
    let rowNumberColumn = { column: "", range: "" };

    if (addRowNumber && !useOriginalSheet) {
      try {
        logger.info("Adicionando fórmula de numeração na cópia da planilha", {
          copySheetName,
          isOriginal: useOriginalSheet,
        });
        rowNumberColumn = await addRowNumbersFormula(
          ctx,
          spreadsheetId,
          copySheetName,
        );
        logger.info("Row numbering formula added", rowNumberColumn);
      } catch (error) {
        logger.warn("Falha ao adicionar fórmula de numeração de linhas", {
          error,
        });
      }
    } else if (addRowNumber && useOriginalSheet) {
      logger.warn(
        "Numeração de linhas ignorada porque estamos usando a planilha original",
      );
    }

    if (select && select.length > 0) {
      logger.info("select", { select });
      queryBuilder.select(select);
    }

    // Se devemos adicionar o número da linha mas não pudemos criar uma fórmula
    // (porque estamos usando a planilha original), então precisamos informar o QueryBuilder
    if (addRowNumber) {
      // Se conseguimos adicionar a fórmula ou usamos a planilha original,
      // vamos incluir a coluna de numeração na consulta
      queryBuilder.includeRowNumber();
      logger.info("Habilitada inclusão de número de linha na consulta");
    }

    if (searchTerm && searchColumns && searchColumns.length > 0) {
      console.log("search across columns", { searchTerm, searchColumns });
      logger.info("search across columns", { searchTerm, searchColumns });
      queryBuilder.searchAcrossColumns(searchTerm, searchColumns);
    }

    logger.info("search across columns", { searchTerm, searchColumns });
    if (Object.keys(labels).length > 0) {
      logger.info("labels", { labels });
      queryBuilder.label(labels);
    }
    logger.info("build query");
    const queryFormula = queryBuilder.build();
    logger.info("query formula", { queryFormula });

    try {
      logger.info("create temp query sheet", { debugMode });
      tempSheetName = await createTempQuerySheet(
        ctx,
        spreadsheetId,
        queryFormula,
        debugMode,
      );

      logger.info("get results");
      const response = await ctx.client
        ["GET /v4/spreadsheets/:spreadsheetId/values/:range"]({
          spreadsheetId,
          range: `${tempSheetName}!A:Z`,
          majorDimension,
          valueRenderOption,
          dateTimeRenderOption,
        });

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`);
      }

      logger.info("process results");
      const data = await response.json();

      if (!data.values) {
        data.values = [];
      }

      // Remover objeto meta completamente
      if (data.meta) {
        delete data.meta;
      }

      logger.info("return data");
      return data;
    } catch (error) {
      logger.error("error", { error });
      if (tempSheetName) {
        await deleteTempSheet(ctx, spreadsheetId, tempSheetName, debugMode);
      }
      throw error;
    } finally {
      // Excluir a aba temporária se não estiver em modo debug
      if (tempSheetName && !debugMode) {
        await deleteTempSheet(ctx, spreadsheetId, tempSheetName, debugMode);
      }
    }
  } finally {
    // Excluir a cópia da aba se não estiver em modo debug e se não for a planilha original
    if (!debugMode && !useOriginalSheet && copySheetName) {
      logger.info("deleting sheet copy");
      await deleteTempSheet(ctx, spreadsheetId, copySheetName, debugMode);
    } else if (debugMode && !useOriginalSheet) {
      logger.info("debug mode: keeping sheet copy", { copySheetName });
    }
  }
};

export default loader;
