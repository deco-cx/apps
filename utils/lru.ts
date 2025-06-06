export const LRU = <K, T>(max: number) => {
  const cache = new Map<K, T>();

  return {
    get: (key: K) => {
      const value = cache.get(key);

      // update LRU index
      if (value) {
        cache.delete(key);
        cache.set(key, value);
      }

      return value;
    },
    set: (key: K, value: T) => {
      if (cache.size > max) {
        const lru = cache.keys().next().value;
        if (lru !== undefined) {
          cache.delete(lru);
        }
      }
      cache.set(key, value);
    },
    delete: (key: K) => {
      cache.delete(key);
    },
  };
};
