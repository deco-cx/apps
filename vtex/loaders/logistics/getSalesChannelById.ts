import type { AppContext } from "../../mod.ts";
import { SalesChannel } from "../../utils/types.ts";

interface Props {
  id: string;
}

/**
 * @title Get Sales Channel by ID
 * @description Get a sales channel by its ID
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SalesChannel> {
  const { vcs } = ctx;

  const salesChannel = await vcs
    ["GET /api/catalog_system/pub/saleschannel/:salesChannelId"]({
      salesChannelId: props.id,
    })
    .then((r) => r.json());

  return salesChannel;
}
