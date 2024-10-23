export const batch = <T>(
  iterable: IterableIterator<T> | T[],
  size: number,
): T[][] => {
  const batches: T[][] = [];

  let current = 0;
  for (const item of iterable) {
    if (batches[current]?.length === size) {
      current++;
    }

    if (!batches[current]) {
      batches[current] = [];
    }

    batches[current].push(item);
  }

  return batches;
};
