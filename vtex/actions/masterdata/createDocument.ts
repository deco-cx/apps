import { AppContext } from "../../mod.ts";
import type { CreateNewDocument } from "../../utils/types.ts";

export interface Props {
  data: Record<string, unknown>;
  acronym: string;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/masterdata-api#post-/api/dataentities/-acronym-/documents
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext
): Promise<CreateNewDocument> => {
  const { vcs } = ctx;
  const { data, acronym } = props;

  const response = await vcs[`POST /api/dataentities/:acronym/documents`](
    { acronym },
    {
      body: data,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    }
  );

  console.log(response.json());

  return response.json();
};

export default action;
