import { fjp } from "../../deps.ts";
import { storage } from "../../fsStorage.ts";
import { Acked, Commands, Events, State } from "../../types.ts";

export interface Props {
  /** Site name */
  site: string;
  /** Environment name */
  name?: string;
  /** Revision etag value */
  revision?: string;
}

const subscribers: WebSocket[] = [];

export const fetchState = async (): Promise<State> => ({
  decofile: await storage.state(),
});

const saveState = ({ decofile }: State): Promise<void> =>
  storage.update(decofile);

// Apply patch and save state ATOMICALLY!
// This is easily done on play. On production, however, we probably
// need a distributed queue
let queue = Promise.resolve();
const patchState = (ops: fjp.Operation[]) => {
  queue = queue.catch(() => null).then(async () =>
    saveState(ops.reduce(fjp.applyReducer, await fetchState()))
  );

  return queue;
};

const action = (_props: Props, req: Request) => {
  const { socket, response } = Deno.upgradeWebSocket(req);

  const broadcast = (event: Acked<Events>) => {
    const message = JSON.stringify(event);
    subscribers.forEach((s) => s.send(message));
  };
  const send = (event: Acked<Events>) => socket.send(JSON.stringify(event));
  const parse = (event: MessageEvent<string>): Acked<Commands> =>
    JSON.parse(event.data);

  const open = () => subscribers.push(socket);
  const close = () => subscribers.splice(subscribers.indexOf(socket), 1);
  const message = async (event: MessageEvent<string>) => {
    const data = parse(event);

    const { ack } = data;

    try {
      if (data.type === "patch-state") {
        try {
          const { payload: operations } = data;

          await patchState(operations);

          // Broadcast changes
          broadcast({
            type: "state-patched",
            payload: operations,
            etag: await storage.revision(),
            metadata: {}, // TODO: add metadata
            ack,
          });
        } catch ({ name, operation }) {
          console.error({ name, operation });
        }
      } else if (data.type === "fetch-state") {
        send({
          type: "state-fetched",
          payload: await fetchState(),
          etag: await storage.revision(),
          ack,
        });
      } else {
        console.error("UNKNOWN EVENT", event);
      }
    } catch (error) {
      console.error(error);

      send({
        type: "operation-failed",
        reason: error.toString(),
        code: "INTERNAL_SERVER_ERROR",
        ack,
      });
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
  socket.onmessage = (e) => message(e).catch(console.error);

  return response;
};

export default action;
