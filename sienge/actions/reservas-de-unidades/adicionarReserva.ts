import type { State } from "../../mod.ts";
import {
  createUnitBookingsClient,
  UnitBooking,
} from "../../clients/unitBookings.ts";

/**
 * Action para adicionar uma reserva de unidade no Sienge
 */
export interface Props {
  /**
   * @title ID do Empreendimento
   * @description Código do empreendimento
   */
  enterpriseId: number;

  /**
   * @title ID da Unidade
   * @description Código da unidade a ser reservada
   */
  unitId: number;

  /**
   * @title ID do Corretor
   * @description Código do corretor responsável pela reserva
   */
  brokerId: number;

  /**
   * @title ID do Cliente
   * @description Código do cliente que está reservando a unidade
   */
  customerId?: number;

  /**
   * @title Data de Validade
   * @description Data de validade da reserva (formato yyyy-MM-dd)
   */
  validityDate?: string;

  /**
   * @title Observações
   * @description Observações sobre a reserva
   */
  note?: string;
}

/**
 * @title Adicionar Reserva de Unidade
 * @description Cadastra uma nova reserva de unidade no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<{ success: boolean; message: string }> => {
  const client = createUnitBookingsClient(ctx.state);

  try {
    const booking: UnitBooking = {
      enterpriseId: props.enterpriseId,
      unitId: props.unitId,
      brokerId: props.brokerId,
      customerId: props.customerId,
      validityDate: props.validityDate,
      note: props.note,
    };

    await client["POST /unit-bookings"](
      {},
      {
        body: booking,
      },
    );

    return {
      success: true,
      message: "Reserva de unidade cadastrada com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao adicionar reserva de unidade:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao adicionar reserva de unidade: ${errorMessage}`,
    };
  }
};

export default action;
