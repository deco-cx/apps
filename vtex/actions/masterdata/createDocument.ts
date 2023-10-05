import { AppContext } from "../../mod.ts";
import type { CreateNewDocument } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  data: Record<string, unknown>;
  acronym: string;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/masterdata-api#post-/api/dataentities/-acronym-/documents
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CreateNewDocument> => {
  const { vcsDeprecated } = ctx;
  const { data, acronym } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const response = await vcsDeprecated
    [`POST /api/dataentities/:acronym/documents`](
      { acronym },
      {
        body: data,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          cookie,
        },
      },
    );

  return response.json();
};

export default action;
