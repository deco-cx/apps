import { Resolvable } from "deco/engine/core/resolver.ts";
import { genMetaInfo, MetaInfo } from "deco/routes/live/_meta.ts";
import { debounce } from "std/async/debounce.ts";
import { storage } from "../../fsStorage.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  /** Environment name to connect to */
  name: string;
}

interface UpdateBlock {
  type: "update-block";
  payload: { id: string; block: Resolvable };
}

interface FetchState {
  type: "fetch-state";
}

interface StateFetched {
  type: "state-fetched";
  payload: State;
}

interface StatePatched {
  type: "state-patched";
  payload: Partial<State>;
}

interface State {
  blocks: Record<string, Resolvable>;
  manifest: MetaInfo["manifest"];
  schema: MetaInfo["schema"];
}

type Commands = UpdateBlock | FetchState;
type Events = StateFetched | StatePatched;

const subscribers: WebSocket[] = [];

// Broadcast new state
// TODO(@gimenes): Remove this debounce to fix jsx editor
storage.onChange(debounce(async () => {
  const { payload } = await fetchState();

  const event: StatePatched = {
    type: "state-patched",
    payload,
  };

  for (const subscriber of subscribers) {
    subscriber.send(JSON.stringify(event));
  }
}, 500));

const fetchState = async (): Promise<StateFetched> => {
  const [blocks, { manifest, schema }] = await Promise.all([
    storage.state(),
    genMetaInfo(storage),
  ]);

  return {
    type: "state-fetched",
    payload: { blocks, manifest, schema },
  };
};

const action = (
  props: Props,
  req: Request,
  ctx: AppContext,
) => {
  try {
    const { socket, response } = Deno.upgradeWebSocket(req);

    const send = (event: Events) => {
      socket.send(JSON.stringify(event));
    };

    const parse = (event: MessageEvent<string>): Commands =>
      JSON.parse(event.data);

    const open = () => {
      subscribers.push(socket);
      console.log("connected", props);
    };

    const close = () => {
      subscribers.splice(subscribers.indexOf(socket), 1);
      console.log("closed");
    };

    const message = async (event: MessageEvent<string>) => {
      try {
        const data = parse(event);

        if (data.type === "update-block") {
          const { payload: { id, block } } = data;
          await ctx.storage.patch({ [id]: block });
        } else if (data.type === "fetch-state") {
          send(await fetchState());
        } else {
          console.error("UNKNOWN EVENT", event);
        }
      } catch (error) {
        console.error(error);
      }
    };

    /**
     * Handles the WebSocket connection on open event.
     */
    socket.onopen = open;
    /**
     * Handles the WebSocket connection on close event.
     */
    socket.onclose = close;

    /**
     * Handles the WebSocket connection on message event.
     * @param {MessageEvent} event - The WebSocket message event.
     */
    socket.onmessage = message;

    return response;
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
