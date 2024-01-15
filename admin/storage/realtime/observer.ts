import { fjp } from "../../deps.ts";

export interface Observed<T> {
  object: T;
  startObserving(): void;
  stopObserving(): void;
}

export function observe<T extends object>(
  obj: T,
  onChange: (patches: fjp.Operation[]) => void,
): Observed<T> {
  let watching = true;
  const stopObserving = () => {
    watching = false;
  };
  const startObserving = () => {
    watching = true;
  };
  const createProxy = (target: T, path = ""): T => {
    return new Proxy(target, {
      get: (target, prop, receiver) => {
        if (
          typeof target[prop as keyof T] === "object" &&
          target[prop as keyof T] !== null
        ) {
          return createProxy(
            // deno-lint-ignore no-explicit-any
            target[prop as keyof T] as any,
            `${path}/${prop as string}`,
          );
        }
        return Reflect.get(target, prop, receiver);
      },
      set: (target, prop, value, receiver) => {
        if (watching) {
          const fullPath = `${path}/${prop as string}`;
          // deno-lint-ignore no-prototype-builtins
          const op = target.hasOwnProperty(prop) ? "replace" : "add";
          const prevValue = op === "add" ? undefined : target[prop as keyof T];
          onChange([
            { path: fullPath, op: "test", value: prevValue },
            {
              path: fullPath,
              op,
              value,
            },
          ]);
        }
        return Reflect.set(target, prop, value, receiver);
      },
      deleteProperty: (target, prop) => {
        if (watching) {
          const fullPath = `${path}/${prop as string}`;
          const prevValue = target[prop as keyof T];
          onChange([{ path: fullPath, op: "test", value: prevValue }, {
            path: fullPath,
            op: "remove",
          }]);
        }
        return Reflect.deleteProperty(target, prop);
      },
    });
  };

  return { object: createProxy(obj), stopObserving, startObserving };
}
