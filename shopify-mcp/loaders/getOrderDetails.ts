import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";
import { GetOrderDetails as GetOrderDetailsQuery } from "../utils/admin/queries.ts";
import {
  GetOrderDetails,
  GetOrderDetailsVariables,
} from "../utils/admin/types.ts";
interface Props {
  query: string;
}

export default async function getOrderDetails(
  { query }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GetOrderDetails | null> {
  const { admin } = ctx;
  try {
    const data = await admin.query<
      GetOrderDetails,
      GetOrderDetailsVariables
    >({
      variables: { query },
      ...GetOrderDetailsQuery,
    });
    return data;
  } catch (error) {
    logger.error(error);
    return null;
  }
}
