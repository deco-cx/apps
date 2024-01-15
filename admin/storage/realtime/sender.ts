interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  // deno-lint-ignore no-explicit-any
  reject: (reason?: any) => void;
}

export const batcher = <E, R, Resp = R extends void ? void : R[]>(
  sender: (elements: E[]) => Promise<Resp>,
  accomulateInMs: number,
): (element: E) => Promise<Resp> => {
  let batch: E[] = [];
  let next: Promise<Resp> | null = null;
  return async (element) => {
    next ??= new Promise<Resp>((resolve) => {
      setTimeout(() => {
        const batchCopy = [...batch];
        batch = [];
        resolve(sender(batchCopy));
        next = null;
      }, accomulateInMs);
    });
    batch.push(element);
    const idx = batch.length - 1;
    const response = await next;
    if (Array.isArray(response)) {
      return response[idx];
    }
    return response;
  };
};
