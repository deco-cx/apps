import { AppContext } from "../../mod.ts";
import type { FieldsList, User } from "../../utils/types.ts";

export interface Props {
  fields: FieldsList
  newPassword: string
  userId: string;
}

/**
 * @docs https://api.lisacx.com.br:9002/occ/v2/swagger-ui.html
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<User> => {
  const { api } = ctx;
  const { fields, newPassword, userId } = props;

  try {
    const response = await api["PUT ​/users​/:userId/password"](
      { fields, new: newPassword, userId }
    ).then((res) => res.json());

    return await response.json();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
