import { AppContext } from "../../mod.ts";
import type { Address, FieldsList } from "../../utils/types.ts";

export interface Props {
  addressId: string;
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
  const { addressId, cartId, fields, userId } = props;

  try {
    const response = await api
      ["PUT ​/users​/:userId​/carts​/:cartId​/addresses/delivery"](
        { addressId, cartId, fields, userId },
      ).then((res) => res.json());

    return await response.json();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
