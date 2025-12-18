import { AppContext } from "../../mod.ts";
import type { IdHrefDocumentID } from "../../utils/openapi/vcs.openapi.gen.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  /**
   * Unique identifier of the document to be created.
   */
  id: string;
  acronym: string;
  data: Record<string, unknown>;
  createIfNotExists?: boolean;
  schema?: string;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/masterdata-api#patch-/api/dataentities/-acronym-/documents?endpoint=patch-/api/dataentities/-acronym-/documents
 * @docs https://developers.vtex.com/docs/api-reference/masterdata-api#patch-/api/dataentities/-acronym-/documents/-id-?endpoint=patch-/api/dataentities/-acronym-/documents/-id-
 * @title Update Document in MasterData
 * @description Update a document in MasterData
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<unknown | IdHrefDocumentID> => {
  const { vcs } = ctx;
  const { id, data, acronym, createIfNotExists, schema } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const requestOptions = {
    body: createIfNotExists ? { ...data, id } : data,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      cookie,
    },
  };

  const response =
    await (createIfNotExists
      ? vcs["PATCH /api/dataentities/:acronym/documents"](
        schema ? { acronym, _schema: schema } : { acronym },
        requestOptions,
      )
      : vcs["PATCH /api/dataentities/:acronym/documents/:id"](
        schema ? { acronym, id, _schema: schema } : { acronym, id },
        requestOptions,
      ));

  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json();
  }

  return;
};

export const defaultVisibility = "private";
export default action;
