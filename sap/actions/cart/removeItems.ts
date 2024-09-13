import { AppContext } from "../../mod.ts";
import type { CartEntry, CartUpdateResponse } from "../../utils/types.ts";

export interface Props {
  cartId: string;
  entryNumber: CartEntry["entryNumber"];
  fields: string;
  userId: string;
}

/**
 * @title SAP Integration
 * @description WORK IN PROGRESS - Action to remove items from the cart
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CartUpdateResponse> => {
  const { api } = ctx;
  const { cartId, entryNumber, fields, userId } = props;

  try {
    const response = await api
      ["DELETE ​/users​/:userId​/carts​/:cartId​/entries/:entryNumber"](
        { cartId, fields, entryNumber, userId },
      ).then((res) => res.json());

    return await response.json();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
