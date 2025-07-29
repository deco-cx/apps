import { AppContext } from "../mod.ts";
import {
  ChargeStatus,
  GetChargesResponse,
  PaymentMethod,
} from "../utils/types.ts";

export interface Props {
  /**
   * @title Initial Expiration Date
   * @description The initial expiration date of the charges. Format: YYYY-MM-DD
   * @example 2025-01-01
   */
  expirationDateInitial?: string;
  /**
   * @title Final Expiration Date
   * @description The final expiration date of the charges. Format: YYYY-MM-DD
   * @example 2025-01-01
   */
  expirationDateFinal?: string;
  /**
   * @title Status
   * @description The status of the charges.
   * @example PENDING
   */
  status?: ChargeStatus;
  /**
   * @title Payment Method
   * @description The payment method of the charges.
   * @example DEBIT_CARD
   */
  paymentMethod?: PaymentMethod;
  /**
   * @title Notification Email
   * @description The email to be notified when the charge is created.
   * @example teste@teste.com
   */
  notificationEmail: string;
  /**
   * @title Customer Document
   * @description The document of the customer.
   * @example 1234567890
   */
  customerDocument?: string;
}

/**
 * @name GET_CHARGES
 * @title Get Charges
 * @description Get a list of charges, based on the search params
 */
export default async function getCharges(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetChargesResponse | null> {
  const { api } = ctx;
  try {
    const response = await api["GET /charges"]({
      ...props,
    });
    if (!response.ok) {
      ctx.errorHandler.toHttpError(response, "Error to get charges");
    }
    return response.json();
  } catch (error) {
    ctx.errorHandler.toHttpError(error, "Error to get charges");
  }
}
