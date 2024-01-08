import { Resolvable } from "deco/engine/core/resolver.ts";
import { genMetaInfo, MetaInfo } from "deco/routes/live/_meta.ts";
import { fjp } from "../../deps.ts";
import { storage } from "../../fsStorage.ts";

export interface Props {
  /** Environment name to connect to */
  name: string;
}

interface PatchState {
  type: "patch-state";
  payload: fjp.Operation[];
  ack: string;
}

interface FetchState {
  type: "fetch-state";
}

interface StatePatched {
  type: "state-patched";
  payload: fjp.Operation[];
  ack: string;
  // Maybe add data and user info in here
  metadata?: unknown;
}

interface StateFetched {
  type: "state-fetched";
  payload: State;
}

interface State {
  blocks: Record<string, Resolvable>;
  manifest: MetaInfo["manifest"];
  schema: MetaInfo["schema"];
}

type Commands = PatchState | FetchState;
type Events = StatePatched | StateFetched;

const subscribers: WebSocket[] = [];

const fetchState = async (): Promise<State> => {
  const [blocks, { manifest, schema }] = await Promise.all([
    storage.state({ forceFresh: true }),
    genMetaInfo(storage),
  ]);

  return { blocks, manifest, schema };
};

const saveState = ({ blocks }: State): Promise<void> => storage.update(blocks);

// Apply patch and save state ATOMICALLY!
// This is easily done on play. On production, however, we probably
// need a distributed queue
let queue = Promise.resolve<fjp.Operation[]>([]);
const patchState = (decofileOps: fjp.Operation[]) => {
  queue = queue.then(async () => {
    const state = await fetchState();
    const observer = fjp.observe<State>(state);

    try {
      await saveState(decofileOps.reduce(fjp.applyReducer, state));

      // Wait for a while before fetching the state
      const newState = await new Promise<State>((resolve) =>
        setTimeout(() => resolve(fetchState()), 1e3)
      );

      state.manifest = newState.manifest;
      state.schema = newState.schema;

      return fjp.generate(observer, true);
    } finally {
      fjp.unobserve(state, observer);
    }
  });

  return queue;
};

const action = (_props: Props, req: Request) => {
  const { socket, response } = Deno.upgradeWebSocket(req);

  const broadcast = (event: Events) => {
    const message = JSON.stringify(event);
    subscribers.forEach((s) => s.send(message));
  };
  const send = (event: Events) => socket.send(JSON.stringify(event));
  const parse = (event: MessageEvent<string>): Commands =>
    JSON.parse(event.data);

  const open = () => subscribers.push(socket);
  const close = () => subscribers.splice(subscribers.indexOf(socket), 1);
  const message = async (event: MessageEvent<string>) => {
    const data = parse(event);

    if (data.type === "patch-state") {
      try {
        const { payload: decofileOps, ack } = data;

        const allOps = await patchState(decofileOps);

        // Broadcast changes
        broadcast({
          type: "state-patched",
          payload: allOps,
          ack,
          metadata: {}, // TODO: add metadata
        });
      } catch (error) {
        console.log(error.name, error.index, error.operation);
      }
    } else if (data.type === "fetch-state") {
      send({ payload: await fetchState(), type: "state-fetched" });
    } else {
      console.error("UNKNOWN EVENT", event);
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
  socket.onmessage = (e) => message(e).catch(() => {});

  return response;
};

export default action;
