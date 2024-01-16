import { fjp, ulid } from "../../deps.ts";
import { ChangeSet } from "../mod2.ts";
import { observe } from "./observer.ts";
import { batcher } from "./sender.ts";

export interface Realtime<T> {
  object: T;
}

export interface Message {
  id: string;
  peerId: string;
  changes: ChangeSet[];
}

export interface LeaderChannel {
  receive: () => AsyncIterableIterator<Message>;
  accept: (message: Message) => void;
  // deno-lint-ignore no-explicit-any
  reject: (message: Message, reason: any) => void;
}
export interface FollowerChannel {
  send: (message: Message) => void;
  receiveAccept: (message: Message) => void;
  receiveReject: (message: Message) => void;
}
export interface MessagesChannel {
  leader: LeaderChannel;
  follower: FollowerChannel;
}

export interface RealtimeOptions {
  channel: MessagesChannel;
  sendDebounce?: number;
}

export const realtime = <T extends object | unknown[]>(
  object: T,
  options: RealtimeOptions,
): Realtime<T> => {
  const peerId = crypto.randomUUID();
  // create a batcher to avoid send every change.
  const send = batcher<fjp.Operation[], void>(
    (patches: fjp.Operation[][]) => {
      const changeSets = patches.map((p) => {
        return {
          id: ulid(),
          patches: p,
          metadata: {
            authors: [{
              name: "unknown",
            }],
            timestamp: Date.now(),
          },
        };
      });
      options.channel.follower.send({
        changes: changeSets,
        id: ulid(),
        peerId,
      });
      return Promise.resolve();
    },
    options.sendDebounce ?? 200,
  );
  // needs to receive ack and rejects from server.

  const { object: observedObject, stopObserving, startObserving } = observe(
    object,
    send,
  );

  // create a channel loop receive to receive notifications from others.
  // the leader should be the one that receives messages and acknowledge them
  (async () => {
    const leader = options.channel.leader;
    for await (
      const message of leader.receive()
    ) {
      const { changes } = message;
      try {
        stopObserving();
        Object.assign(
          observedObject,
          changes.flatMap((c) => c.patches).reduce(
            fjp.applyReducer,
            observedObject,
          ),
        );
        leader.accept(message);
      } catch (err) {
        leader.reject(message, err);
      } finally {
        startObserving();
      }
    }
  })();
  return {
    object: observedObject,
  };
};
