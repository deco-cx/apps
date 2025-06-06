import { AppContext } from "../mod.ts";
import {
  FORMULA_ADD_ROW_NUMBER,
  TEMP_QUERY_SHEET_NAME,
} from "../utils/constant.ts";
import { SheetsQueryBuilder } from "../utils/queryBulder.ts";
import { ValueRange } from "../utils/types.ts";

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
   * @title Colunas
   * @description Lista de colunas a serem selecionadas (ex: ["A", "B", "C"] ou ["Nome", "Sobrenome"])
   */
  select?: string[];

  /**
   * @title Termo de Busca
   * @description Termo para buscar em várias colunas
   */
  searchTerm: string;

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
   * @title Incluir Coluna de Número de Linha
   * @description Se deve incluir a coluna de número de linha na resposta
   */
  includeRowNumber?: boolean;
}

async function createTempQuerySheet(
  ctx: AppContext,
  spreadsheetId: string,
  queryFormula: string,
): Promise<string> {
  const sheetResult = await ctx.invoke["google-sheets"].actions.createSheet({
    spreadsheetId,
    sheetName: TEMP_QUERY_SHEET_NAME,
    insertIndex: 0,
  });

  if (!sheetResult.success) {
    throw new Error("Erro ao criar aba temporária para a consulta");
  }

  const addFormulaResult = await ctx.invoke["google-sheets"].actions.addFormula(
    {
      spreadsheetId,
      sheetName: sheetResult.sheetName,
      range: "A1",
      formula: queryFormula,
    },
  );

  if (!addFormulaResult.success) {
    throw new Error("Erro ao adicionar fórmula QUERY");
  }

  return sheetResult.sheetName;
}

async function deleteTempSheet(
  ctx: AppContext,
  spreadsheetId: string,
  sheetName: string,
): Promise<void> {
  await ctx.invoke["google-sheets"].actions.deleteSheet({
    spreadsheetId,
    sheetName,
    silentFail: true,
  });
}

async function findFirstEmptyColumn(
  ctx: AppContext,
  spreadsheetId: string,
  sheetName: string,
): Promise<string> {
  const response = await ctx.client
    ["GET /v4/spreadsheets/:spreadsheetId/values/:range"]({
      spreadsheetId,
      range: `${sheetName}!A1:ZZ1`,
    });

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados da planilha: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.values || !data.values[0]) {
    return "A";
  }

  const nextColumnIndex = data.values[0].length;

  return indexToColumnLetter(nextColumnIndex);
}

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

async function addRowNumbersFormula(
  ctx: AppContext,
  spreadsheetId: string,
  sheetName: string,
): Promise<{ column: string; range: string }> {
  const column = await findFirstEmptyColumn(ctx, spreadsheetId, sheetName);
  const range = `${column}1`;
  const formula = FORMULA_ADD_ROW_NUMBER;

  const result = await ctx.invoke["google-sheets"].actions.addFormula({
    spreadsheetId,
    sheetName,
    range,
    formula,
  });

  if (!result.success) {
    throw new Error("Erro ao adicionar fórmula de numeração");
  }

  return { column, range: result.updatedRange };
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
  const {
    spreadsheetId,
    sheet,
    range = "A:Z",
    select,
    searchTerm,
    searchColumns,
    headerRow = 1,
    majorDimension = "ROWS",
    valueRenderOption = "FORMATTED_VALUE",
    dateTimeRenderOption = "SERIAL_NUMBER",
    includeRowNumber = false,
  } = props;

  let copySheetName = "";

  const copyResult = await ctx.invoke["google-sheets"].actions.copySheet({
    spreadsheetId,
    sheetName: sheet,
  });

  if (copyResult.success) {
    copySheetName = copyResult.copyName;
  }

  let tempSheetName = "";

  try {
    // Obter os cabeçalhos usando o novo loader
    const headers = await ctx.invoke["google-sheets"].loaders.getSheetHeaders({
      spreadsheetId,
      sheetName: copySheetName,
      range,
      headerRow,
      majorDimension,
      valueRenderOption,
    });

    const queryBuilder = new SheetsQueryBuilder();

    queryBuilder.range(copySheetName, range);
    queryBuilder.header(headerRow);
    queryBuilder.headerMap(headers.headerMap);

    if (includeRowNumber) {
      await addRowNumbersFormula(
        ctx,
        spreadsheetId,
        copySheetName,
      );
    }

    if (select && select.length > 0) {
      queryBuilder.select(select);
    }

    queryBuilder.includeRowNumber();

    if (searchTerm) {
      const columnsToSearch = searchColumns?.length
        ? searchColumns
        : Array.from(headers.headerMap.keys());
      queryBuilder.searchAcrossColumns(searchTerm, columnsToSearch);
    }

    if (Object.keys(headers.labels).length > 0) {
      queryBuilder.label(headers.labels);
    }

    const queryFormula = queryBuilder.build();

    try {
      tempSheetName = await createTempQuerySheet(
        ctx,
        spreadsheetId,
        queryFormula,
      );

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

      const data = await response.json();

      if (!data.values) {
        data.values = [];
      }

      if (data.meta) {
        delete data.meta;
      }
      await Promise.all([
        deleteTempSheet(ctx, spreadsheetId, tempSheetName),
        deleteTempSheet(ctx, spreadsheetId, copySheetName),
      ]);

      return data;
    } catch (error) {
      throw error;
    }
  } catch (error) {
    const promises = [];

    if (tempSheetName) {
      promises.push(deleteTempSheet(ctx, spreadsheetId, tempSheetName));
    }

    if (copySheetName) {
      promises.push(deleteTempSheet(ctx, spreadsheetId, copySheetName));
    }

    await Promise.all(promises);

    throw error;
  }
};

export default loader;
