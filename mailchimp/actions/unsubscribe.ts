import { HttpError } from "../../utils/http.ts";
import { AppContext } from "../mod.ts";
import { toMd5 } from "../utils/transform.ts";

interface Props {
  listId: string;
  memberHash?: string;
  email?: string;
}

export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { listId, memberHash, email } = props;
  const { api } = ctx;

  const hash = memberHash || (email && await toMd5(email));

  if (!hash) {
    throw new HttpError(400, "No member hash or email provided");
  }

  await api["PUT /3.0/lists/:id/members/:hash"]({ id: listId, hash }, {
    body: {
      status: "unsubscribed",
      email_address: email,
    },
  });
}
