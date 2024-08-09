import { AppContext } from "../../mod.ts";
import type { Address, FieldsList } from "../../utils/types.ts";

export interface Props {
  address: Address;
  cartId: string;
  fields: FieldsList;
  userId: string;
}

/**
 * @docs https://api.lisacx.com.br:9002/occ/v2/swagger-ui.html
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
      ["POST ​/users​/:userId​/carts​/:cartId​/addresses/delivery"](
        { address, cartId, fields, userId },
      ).then((res) => res.json());

    return await response.json();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
