import { setCookie } from "std/http/cookie.ts";
import { AppContext } from "../mod.ts";
import { toMd5 } from "../utils/transform.ts";

interface Props {
  listId: string;
  email: string;
  /**
   * @description The key-value pairs of merge fields for the member (the keys should be the merge tags in the list).
   * @docs https://mailchimp.com/developer/marketing/docs/merge-fields/
   */
  merge_fields?: Record<string, string>;
}

export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { listId, email, merge_fields } = props;
  const { api } = ctx;

  const memberHash = await toMd5(email);
  const member = await api["GET /3.0/lists/:id/members/:hash"](
    {
      id: listId,
      hash: memberHash,
    },
  ).then((res) => res.json()).catch(() => null);

  if (!member) {
    await api["POST /3.0/lists/:id/members"]({ id: listId }, {
      body: {
        status: "subscribed",
        email_address: email,
        merge_fields,
      },
    });
  } else {
    await api["PUT /3.0/lists/:id/members/:hash"](
      { id: listId, hash: memberHash },
      {
        body: {
          status: "subscribed",
          email_address: email,
          merge_fields,
        },
      },
    );
  }
  setCookie(ctx.response.headers, {
    name: "mailchimp_email_hash",
    value: memberHash,
    path: "/",
    httpOnly: true,
    secure: true,
  });
}
