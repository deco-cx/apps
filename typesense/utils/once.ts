import { deferred } from "std/async/deferred.ts";

export const once = <T>(cb: () => Promise<T>) => {
  let promise = deferred<T>();
  let run = true;

  const reset = () => {
    promise = deferred<T>();
    run = true;
  };

  return async () => {
    if (run) {
      run = false;

      try {
        const response = await cb();
        promise.resolve(response);
      } catch (error) {
        promise.reject(error);

        reset();
      }
    }

    return promise;
  };
};
