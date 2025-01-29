export function pick<
  T extends object,
  K extends keyof T = keyof T,
>(
  keys: K[],
  obj: T | null | undefined,
): Pick<T, K> | null {
  if (!keys.length || !obj) {
    return null;
  }

  const entries = keys.map((key) => [key, obj[key]]);

  return Object.fromEntries(entries);
}

export function omit<T extends object, K extends keyof T>(
  keys: K[],
  obj: T | null | undefined,
): Omit<T, K> | null {
  if (!keys.length || !obj) {
    return null;
  }

  const pickedKeys = (Object.keys(obj) as K[]).filter(
    (key) => !keys.includes(key),
  );

  return pick(pickedKeys, obj) as unknown as Omit<T, K>;
}
