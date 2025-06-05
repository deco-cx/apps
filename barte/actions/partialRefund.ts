import { AppContext } from "../mod.ts";
import { PartialRefundResponse } from "../utils/types.ts";

interface Props {
  /**
   * @title Charge UUID
   * @description The UUID of the charge to refund (uuid · string)
   */
  uuid: string;
  /**
   * @title Refund Value
   * @description Value to be refunded (value · number · double)
   */
  value: number;
}

/**
 * @name PARTIAL_REFUND
 * @title Partial Refund
 * @description Refund a partial amount of a charge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PartialRefundResponse> => {
  const { api } = ctx;
  const { uuid, value } = props;

  const response = await api["PATCH /charges/partial-refund/:uuid"]({
    uuid,
  }, { body: { value } });

  const result = await response.json();

  return result;
};

export default action;
