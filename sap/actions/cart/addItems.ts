import { AppContext } from "../../mod.ts";
import type { CartEntry, CartUpdateResponse } from "../../utils/types.ts";

export interface Props {
  cartId: string;
  entry: CartEntry;
  fields: string;
  userId: string;
}

/**
 * @title SAP Integration
 * @description WORK IN PROGRESS - Action to add items to the cart
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CartUpdateResponse> => {
  const { api } = ctx;
  const { cartId, entry, fields, userId } = props;

  try {
    const response = await api["POST /users/:userId/carts/:cartId/entries"](
      { cartId, fields, entry, userId },
    ).then((res: Response) => res.json());

    return await response.json();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
