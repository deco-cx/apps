import { AppContext } from "../mod.ts";
import { toMd5 } from "../utils/transform.ts";

interface Props {
  listId: string;
  email: string;
}

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { listId, email } = props;
  const { api } = ctx;

  const hash = await toMd5(email);
  const member = await api["GET /3.0/lists/:id/members/:hash"](
    {
      id: listId,
      hash,
    },
  ).then((res) => res.json()).catch(() => null);

  return member;
}
