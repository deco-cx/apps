import { AppContext } from "../../mod.ts";
import { Bill, createBillDebtClient } from "../../clients/billDebt.ts";

export interface Props {
  /**
   * @title Data Inicial
   * @description Data inicial de emissão para consulta de títulos (formato yyyy-MM-dd)
   */
  startDate: string;

  /**
   * @title Data Final
   * @description Data final de emissão para consulta de títulos (formato yyyy-MM-dd)
   */
  endDate: string;

  /**
   * @title ID da Empresa
   * @description Código da empresa cadastrada no Sienge
   */
  debtorId?: number;

  /**
   * @title ID do Credor
   * @description Código do credor cadastrado no Sienge
   */
  creditorId?: number;

  /**
   * @title ID do Centro de Custo
   * @description Código do centro de custo cadastrado no Sienge
   */
  costCenterId?: number;

  /**
   * @title Códigos de Documentos
   * @description Lista de códigos de documentos separados por vírgula
   */
  documentsIdentificationId?: string;

  /**
   * @title Número do Documento
   * @description Número do documento vinculado ao título
   */
  documentNumber?: string;

  /**
   * @title Status
   * @description Tipo de consistência do título (S: Completo, N: Incompleto, I: Em inclusão)
   */
  status?: string;

  /**
   * @title Origem
   * @description Código de origem do título
   */
  originId?: string;

  /**
   * @title Limite
   * @description Quantidade máxima de resultados a serem retornados (máx: 200)
   * @default 100
   */
  limit?: number;

  /**
   * @title Deslocamento
   * @description Índice inicial para paginação dos resultados
   * @default 0
   */
  offset?: number;
}

/**
 * @title Buscar Títulos do Contas a Pagar
 * @description Retorna uma lista de títulos do contas a pagar com base nos filtros especificados
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ titulos: Bill[]; total: number }> => {
  const billDebtClient = createBillDebtClient(ctx);

  // Converter string de IDs em array quando fornecido
  const documentsIdentificationId = props.documentsIdentificationId
    ? props.documentsIdentificationId.split(",").map((id) => id.trim())
    : undefined;

  const response = await billDebtClient["GET /bills"]({
    startDate: props.startDate,
    endDate: props.endDate,
    debtorId: props.debtorId,
    creditorId: props.creditorId,
    costCenterId: props.costCenterId,
    documentsIdentificationId,
    documentNumber: props.documentNumber,
    status: props.status,
    originId: props.originId,
    limit: props.limit,
    offset: props.offset,
  });

  const responseData = await response.json();

  return {
    titulos: responseData.results,
    total: responseData.resultSetMetadata.count,
  };
};

export default loader;
