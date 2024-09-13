import { AppContext } from "../../mod.ts";
import type { Address } from "../../utils/types.ts";

export interface Props {
  address: Address;
  cartId: string;
  fields: string;
  userId: string;
}

/**
 * @title SAP Integration
 * @description WORK IN PROGRESS - Action to create delivery address during checkout.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Address> => {
  const { api } = ctx;
  const { address, cartId, fields, userId } = props;

  try {
    const response = await api
      ["POST /users/:userId/carts/:cartId/addresses/delivery"](
        { address, cartId, fields, userId },
      ).then((res: Response) => res.json());

    return await response.json();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
