import { type createHttpClient } from "../../utils/http.ts";
import { type AppContext } from "../mod.ts";
import { type ChaordicAPI } from "../utils/chaordic.ts";
import { type LinxAPI } from "../utils/client.ts";
import { type EventsAPI } from "../utils/events.ts";

export type Config = {
  api: ReturnType<typeof createHttpClient<LinxAPI>>;
  eventsApi: ReturnType<typeof createHttpClient<EventsAPI>>;
  chaordicApi: ReturnType<typeof createHttpClient<ChaordicAPI>>;
};

const loader = (_props: unknown, _req: Request, ctx: AppContext): Config => ({
  api: ctx.api,
  eventsApi: ctx.eventsApi,
  chaordicApi: ctx.chaordicApi,
});

export default loader;
