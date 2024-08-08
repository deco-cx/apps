export const once = <T>(cb: () => Promise<T>) => {
  let promise = Promise.withResolvers<T>();
  let run = true;

  const reset = () => {
    promise = Promise.withResolvers<T>();
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

    return promise.promise;
  };
};
