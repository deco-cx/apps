import { AppContext } from "../../mod.ts";
import type { CreateNewDocument } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  data: Record<string, unknown>;
  acronym: string;
  isPrivateEntity?: boolean;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/masterdata-api#post-/api/dataentities/-acronym-/documents
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CreateNewDocument> => {
  const { vcs, vcsDeprecated } = ctx;
  const { data, acronym, isPrivateEntity } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const requestOptions = {
    body: data,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      cookie,
    },
  };

  const response =
    await (isPrivateEntity
      ? vcs[`POST /api/dataentities/:acronym/documents`](
        { acronym },
        requestOptions,
      )
      : vcsDeprecated[`POST /api/dataentities/:acronym/documents`](
        { acronym },
        requestOptions,
      ));

  return response.json();
};

export default action;
