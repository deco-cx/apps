import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";
import type { CreateNewDocument } from "../../utils/types.ts";

export interface Props {
  data: Record<string, unknown>;
  acronym: string;
  schema?: string;
  /**
   * @deprecated Ignored. Requests always use the app's App Key/Token when configured.
   * @hide true
   */
  isPrivateEntity?: boolean;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/masterdata-api#post-/api/dataentities/-acronym-/documents
 * @title Create Document in MasterData
 * @description Create a new document in MasterData
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CreateNewDocument> => {
  const { vcs } = ctx;
  const { data, acronym, schema } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const response = await vcs[`POST /api/dataentities/:acronym/documents`](
    schema ? { acronym, _schema: schema } : { acronym },
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

export const defaultVisibility = "private";
export default action;
