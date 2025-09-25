import type { AppContext } from "../../mod.ts";
import type { GetSessionResponse } from "../../utils/openapi/vcs.openapi.gen.ts";

interface Props {
  /**
   * Items are the keys of the values you wish to get. They follow the format namespace1.key1,namespace2.key2.
   *
   * If you wish to recover the data sent on Create new session, it should be public.{key}, replacing {key} with the name of the custom property you created. Following the example request presented in Create new session, it would be public.variable1,public.variable2.
   *
   * If you want to retrieve all keys from Session Manager, you can use the wildcard operator (*) as a value for this query parameter.
   */
  items: string[];
}

/**
 * @title Get Session
 * @description Get a session
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<GetSessionResponse> {
  const { vcs } = ctx;

  const response = await vcs["GET /api/sessions"]({
    items: props.items?.join(",") || "*",
  }, {
    headers: { cookie: req.headers.get("cookie") || "" },
  });

  if (!response.ok) {
    throw new Error(`Failed to get session: ${response.status}`);
  }

  return await response.json();
}

export default loader;
