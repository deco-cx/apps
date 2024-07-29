import { STALE } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";

interface Props {
  term?: string;
}

export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
) {
  const { vcsDeprecated } = ctx;
  const term = props.term ?? new URL(req.url).pathname.slice(1); // remove first slash

  return await vcsDeprecated
    ["GET /api/catalog_system/pub/portal/pagetype/:term"]({
      term,
    }, STALE).then((res) => res.json());
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: AppContext) =>
  props.term ? props.term : new URL(req.url).pathname;
