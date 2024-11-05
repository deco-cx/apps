import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  data: Record<string, unknown>;
  acronym: string;
  documentId: string;
  isPrivateEntity?: boolean;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/master-data-api-v2#patch-/api/dataentities/-dataEntityName-/documents/-id-
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { vcs, vcsDeprecated } = ctx;
  const { data, acronym, documentId, isPrivateEntity } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const requestOptions = {
    body: data,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      cookie,
    },
  };

  await (isPrivateEntity
    ? vcs["PATCH /api/dataentities/:acronym/documents/:id"](
      { acronym, id: documentId },
      requestOptions,
    )
    : vcsDeprecated[`PATCH /api/dataentities/:acronym/documents/:documentId`](
      { acronym, documentId },
      requestOptions,
    ));
};

export default action;
