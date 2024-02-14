import { Deferred, deferred } from "deco/utils/promise.ts";
import { fjp, Queue, ulid } from "../../deps.ts";
import { ChangeSet } from "../mod.ts";
import { deepMerge } from "./merge.ts";
import { observe } from "./observer.ts";

export interface Realtime<T> {
  object: T;
}

export interface ObjectState<T> {
  value: T;
  id: string;
}

export interface Message {
  peerId: string;
  changeSet: ChangeSet;
}

export interface LeaderChannel<T extends object | unknown[]> {
  receive: () => AsyncIterableIterator<Message>;
  accept: (message: AcceptedMessage) => void;
  reject: (message: RejectedMessage<T>) => void;
  awaitLeadership: () => Promise<void>;
  broadcastState: (state: ObjectState<T>) => void;
  die: () => Promise<void>;
}
export interface AckedMessage {
  peerId: string;
  changeSet: ChangeSet;
  type: string;
}

export interface AcceptedMessage extends AckedMessage {
  type: "accepted";
}

export interface RejectedMessage<T extends object | unknown[]>
  extends AckedMessage {
  type: "rejected";
  state: ObjectState<T>;
  // deno-lint-ignore no-explicit-any
  reason: any;
}

export interface FollowerChannel<T extends object | unknown[]> {
  send: (message: Message) => void;
  rejected: () => AsyncIterableIterator<RejectedMessage<T>>;
  accepted: () => AsyncIterableIterator<AcceptedMessage>;
}
export interface MessagesChannel<T extends object | unknown[]> {
  leader: LeaderChannel<T>;
  follower: FollowerChannel<T>;
}

export interface RealtimeOptions<T extends object | unknown[]> {
  channel: MessagesChannel<T>;
  onConflict: (
    state: ObjectState<T>,
    changeSet: ChangeSet,
    // deno-lint-ignore no-explicit-any
    reason: any,
  ) => Promise<T>;
  onChange: (state: ObjectState<T>) => Promise<void>;
  sendDebounce?: number;
}

/**
 * background function, it receives an async function and invokes it
 */
export const bg = (f: () => Promise<void>) => {
  setTimeout(f, 0);
};
export const realtime = <T extends object | unknown[]>(
  object: T,
  options: RealtimeOptions<T>,
): Realtime<T> => {
  const currentState = { value: structuredClone(object), id: ulid() };
  const peerId = crypto.randomUUID();
  const changesQ = new Queue<fjp.Operation[]>();
  const ack: Record<string, Deferred<void>> = {};
  // send loop
  bg(async () => {
    while (true) {
      const patches = await changesQ.pop();
      const id = ulid();
      options.channel.follower.send({
        peerId,
        changeSet: {
          id,
          patches,
          metadata: {
            authors: [{
              name: "unknown",
            }],
            timestamp: Date.now(),
          },
        },
      });
      ack[id] = deferred<void>();
      await ack[id];
    }
  });

  // needs to receive ack and rejects from server.
  const { object: desiredState, stopObserving, startObserving } = observe(
    object,
    changesQ.push.bind(changesQ),
  );

  // reject loop
  bg(async () => {
    const follower = options.channel.follower;
    for await (
      const message of follower.rejected()
    ) {
      const { changeSet, reason, state } = message;
      deepMerge(
        desiredState,
        await options.onConflict(state, changeSet, reason),
      ); // this will trigger the desired patches.
    }
  });

  // accept loop
  bg(async () => {
    const follower = options.channel.follower;
    for await (
      const message of follower.accepted()
    ) {
      const { changeSet, peerId: fromPeer } = message;
      if (fromPeer === peerId) { // if it is an accept message by me so ack should be necessary so I can send next message.
        ack[changeSet.id].resolve();
        continue;
      }
      try {
        currentState.value = changeSet.patches.reduce(
          fjp.applyReducer,
          currentState.value,
        );
        currentState.id = changeSet.id;
      } catch (err) {
        console.error(
          "this error seems a bug in the realtime algorithm as followers should always be possible to apply patches as they arrive.",
        );
        throw err;
      }
      try {
        stopObserving();
        fjp.applyPatch(desiredState, changeSet.patches, true, true);
      } catch (err) {
        startObserving();
        // resolving conflict
        deepMerge(
          desiredState,
          await options.onConflict(currentState, changeSet, err),
        ); // this will trigger the desired patches.
      } finally {
        startObserving();
      }
      await options.onChange(currentState);
    }
  });

  // the leader should be the one that receives messages and acknowledge them
  bg(async () => {
    const leader = options.channel.leader;
    await leader.awaitLeadership();
    leader.broadcastState(currentState);
    for await (
      const message of leader.receive()
    ) {
      const { changeSet } = message;
      try {
        currentState.value = changeSet.patches.reduce(
          fjp.applyReducer,
          currentState.value,
        );
        currentState.id = changeSet.id;
        leader.accept({ changeSet, peerId, type: "accepted" });
      } catch (err) {
        leader.reject({
          changeSet,
          peerId,
          type: "rejected",
          state: currentState,
          reason: err,
        });
      }
    }
    await leader.die();
  });
  return {
    object: desiredState,
  };
};
