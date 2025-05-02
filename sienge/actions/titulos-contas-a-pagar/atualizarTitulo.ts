import { AppContext } from "../../mod.ts";
import {
  BillAdditionalInformation,
  BillUpdate,
  createBillDebtClient,
} from "../../clients/billDebt.ts";

export interface Props {
  /**
   * @title ID do Título
   * @description Código único do título no contas a pagar
   */
  billId: number;

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
   * @title Observação
   * @description Observação do título
   */
  note?: string;

  /**
   * @title Informações Adicionais (JSON)
   * @description Informações adicionais do título em formato JSON
   */
  additionalInformation?: string;
}

/**
 * @title Atualizar Título do Contas a Pagar
 * @description Atualiza as informações de um título existente no contas a pagar
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

    const billData: BillUpdate = {
      documentNumber: props.documentNumber,
      documentsIdentificationId: props.documentsIdentificationId,
      note: props.note,
      additionalInformation,
    };

    await billDebtClient["PATCH /bills/:billId"](
      {
        billId: props.billId,
      },
      {
        body: billData,
      },
    );

    return true;
  } catch (error) {
    console.error("Erro ao atualizar título:", error);
    return false;
  }
};

export default action;
