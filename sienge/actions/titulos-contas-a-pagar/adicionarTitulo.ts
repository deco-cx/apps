import { AppContext } from "../../mod.ts";
import {
  BillAdditionalInformation,
  BillBudgetCategory,
  BillDepartment,
  BillEnterprise,
  BillInsert,
  BillInstallment,
  createBillDebtClient,
} from "../../clients/billDebt.ts";

export interface Props {
  /**
   * @title ID da Empresa
   * @description Código da empresa devedora
   */
  debtorId: number;

  /**
   * @title ID do Credor
   * @description Código do credor
   */
  creditorId: number;

  /**
   * @title Data de Emissão
   * @description Data de emissão do título (formato yyyy-MM-dd)
   */
  issueDate: string;

  /**
   * @title Número do Documento
   * @description Número do documento do título
   */
  documentNumber?: string;

  /**
   * @title Código do Documento
   * @description Código de identificação do documento
   */
  documentsIdentificationId?: string;

  /**
   * @title Valor do Título
   * @description Valor bruto do título
   */
  billValue: number;

  /**
   * @title Valor de Imposto Retido
   * @description Valor de imposto retido do título
   */
  retainedTaxValue?: number;

  /**
   * @title Origem
   * @description Código de origem do título
   */
  originId?: string;

  /**
   * @title Observação
   * @description Observação do título
   */
  note?: string;

  /**
   * @title Desconto
   * @description Valor de desconto do título
   */
  discount?: number;

  /**
   * @title Acréscimo
   * @description Valor de acréscimo do título
   */
  addition?: number;

  /**
   * @title Informações Adicionais (JSON)
   * @description Informações adicionais do título em formato JSON
   */
  additionalInformation?: string;

  /**
   * @title Parcelas (JSON)
   * @description Lista de parcelas do título em formato JSON. Exemplo: [{"installmentId": 1, "dueDate": "2023-12-25", "grossValue": 1000.0}]
   */
  installments: string;

  /**
   * @title Categorias de Orçamento (JSON)
   * @description Lista de categorias de orçamento em formato JSON (opcional)
   */
  budgetCategories?: string;

  /**
   * @title Departamentos (JSON)
   * @description Lista de departamentos em formato JSON (opcional)
   */
  departments?: string;

  /**
   * @title Obras (JSON)
   * @description Lista de obras em formato JSON (opcional)
   */
  enterprises?: string;
}

/**
 * @title Adicionar Título do Contas a Pagar
 * @description Cadastra um novo título no contas a pagar
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<boolean> => {
  const billDebtClient = createBillDebtClient(ctx);

  try {
    // Convertendo strings JSON para objetos
    const additionalInformation: BillAdditionalInformation | undefined =
      props.additionalInformation
        ? JSON.parse(props.additionalInformation)
        : undefined;

    const installments: BillInstallment[] = JSON.parse(props.installments);

    const budgetCategories: BillBudgetCategory[] | undefined =
      props.budgetCategories ? JSON.parse(props.budgetCategories) : undefined;

    const departments: BillDepartment[] | undefined = props.departments
      ? JSON.parse(props.departments)
      : undefined;

    const enterprises: BillEnterprise[] | undefined = props.enterprises
      ? JSON.parse(props.enterprises)
      : undefined;

    // Verificando se todas as parcelas têm os campos obrigatórios
    for (const installment of installments) {
      if (
        !installment.installmentId || !installment.dueDate ||
        !installment.grossValue
      ) {
        throw new Error(
          "Todas as parcelas devem ter installmentId, dueDate e grossValue",
        );
      }
    }

    const billData: BillInsert = {
      debtorId: props.debtorId,
      creditorId: props.creditorId,
      issueDate: props.issueDate,
      documentNumber: props.documentNumber,
      documentsIdentificationId: props.documentsIdentificationId,
      billValue: props.billValue,
      retainedTaxValue: props.retainedTaxValue,
      originId: props.originId,
      note: props.note,
      discount: props.discount,
      addition: props.addition,
      additionalInformation,
      installments,
      budgetCategories,
      departments,
      enterprises,
    };

    await billDebtClient["POST /bills"](
      {},
      {
        body: billData,
      },
    );

    return true;
  } catch (error) {
    console.error("Erro ao adicionar título:", error);
    return false;
  }
};

export default action;
