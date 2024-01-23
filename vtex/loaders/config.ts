import { type createGraphqlClient } from "../../utils/graphql.ts";
import { type createHttpClient } from "../../utils/http.ts";
import { type AppContext } from "../mod.ts";
import { type SP } from "../utils/client.ts";
import { type OpenAPI as API } from "../utils/openapi/api.openapi.gen.ts";
import { type OpenAPI as VCS } from "../utils/openapi/vcs.openapi.gen.ts";

export type Config = {
  sp: ReturnType<typeof createHttpClient<SP>>;
  io: ReturnType<typeof createGraphqlClient>;
  vcs: ReturnType<typeof createHttpClient<VCS>>;
  api: ReturnType<typeof createHttpClient<API>>;
};

const loader = (_props: unknown, _req: Request, ctx: AppContext): Config => ({
  sp: ctx.sp,
  io: ctx.io,
  vcs: ctx.vcs,
  api: ctx.api,
});

export default loader;
