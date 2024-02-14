import { Decofile } from "./mod.ts";

export interface Observable {
  decofile: Decofile;
  changes: string[];
}
// records a function that observe changes in decofile at first level.
export const observe = (decofile: Decofile): Observable => {
  const changes: string[] = [];
  const proxy = new Proxy(decofile, {
    set(target, property, value) {
      // Perform the actual set operation
      target[property as string] = value;
      changes.push(property as string);

      return true;
    },
    get(target, property) {
      changes.push(property as string);
      return target[property as string];
    },
    deleteProperty(target, property) {
      // Perform the actual delete operation
      const deleted = delete target[property as string];
      changes.push(property as string);
      // Indicate success
      return deleted;
    },
  });
  return {
    decofile: proxy,
    changes,
  };
};
