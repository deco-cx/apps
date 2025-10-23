import type { AppContext } from "../../mod.ts";
import { SalesChannel } from "../../utils/types.ts";

/**
 * @title List Sales Channels
 * @description List all sales channels
 */
export default async function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<SalesChannel[]> {
  const { vcs } = ctx;

  const salesChannel = await vcs
    ["GET /api/catalog_system/pvt/saleschannel/list"]({})
    .then((r) => r.json());

  return salesChannel;
}
