import { AppContext } from "../../mod.ts";
import type { User } from "../../utils/types.ts";

export interface Props {
  fields: string;
  userId: string;
}

/**
 * @title SAP Integration
 * @description WORK IN PROGRESS - Action to delete an user
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<User> => {
  const { api } = ctx;
  const { fields, userId } = props;

  try {
    const response = await api["DELETE /users/:userId"](
      { fields, userId },
    ).then((res: Response) => res.json());

    return await response.json();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
