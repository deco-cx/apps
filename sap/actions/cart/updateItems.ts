import { AppContext } from "../../mod.ts";
import type {
  CartEntry,
  CartUpdateResponse,
  FieldsList,
} from "../../utils/types.ts";

export interface Props {
  cartId: string;
  entry: CartEntry;
  entryNumber: CartEntry["entryNumber"];
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
): Promise<CartUpdateResponse> => {
  const { api } = ctx;
  const { cartId, entry, entryNumber, fields, userId } = props;

  try {
    const response = await api
      ["PUT ​/users​/:userId​/carts​/:cartId​/entries/:entryNumber"](
        { cartId, fields, entry, entryNumber, userId },
      ).then((res) => res.json());

    return await response.json();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
