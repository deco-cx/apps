import type { State } from "../../mod.ts";
import { createUnitBookingsClient } from "../../clients/unitBookings.ts";

/**
 * Action para inativar uma reserva de unidade no Sienge
 */
export interface Props {
  /**
   * @title ID da Unidade
   * @description Código da unidade cuja reserva será inativada
   */
  id: number;
}

/**
 * @title Inativar Reserva de Unidade
 * @description Inativa uma reserva de unidade no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<{ success: boolean; message: string }> => {
  const client = createUnitBookingsClient(ctx.state);

  try {
    await client["PATCH /unit-bookings/units/:id/deactivate"]({
      id: props.id,
    });

    return {
      success: true,
      message: "Reserva de unidade inativada com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao inativar reserva de unidade:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao inativar reserva de unidade: ${errorMessage}`,
    };
  }
};

export default action;
