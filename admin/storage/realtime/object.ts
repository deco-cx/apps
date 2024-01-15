import { ChangeSet } from "../mod2.ts";
import { fjp } from "../../deps.ts";
export interface Realtime<T> {
  object: T;
}
export interface ChangesChannel {
  receive: (since?: string) => AsyncIterableIterator<ChangeSet[]>;
  send: (changes: ChangeSet[]) => Promise<void>;
}

export interface RealtimeOptions {
  channel: ChangesChannel;
  sendDebounce?: number;
}

export const realtime = <T extends object | unknown[]>(
  object: T,
  options: RealtimeOptions,
): Realtime<T> => {
  let observer = fjp.observe(object);
  (async () => {
    for await (const changes of options.channel.receive()) {
      fjp.unobserve(object, observer);
      changes.forEach((c) => {
        fjp.applyPatch(object, c.patches, true, true);
      });
      observer = fjp.observe(object);
    }
  })();
  return {
    object,
  };
};

this;
