import { LRU } from "./lru.ts";

/**
 * @description m is minute, h is hour and d is day
 */
type TimeUnit = "m" | "h" | "d";
/**
 * @description representation of time with timeunit @type {TimeUnit}
 */
type CacheKeyWindow = `${number}${TimeUnit}`;

/**
 * @description given a CacheKeyWindow returns a number in milliseconds representing this
 */
const getWindowCacheFromTimeUnit = (time: CacheKeyWindow): number => {
  const MILLIS: number = 1_000;
  const timeUnit = time.at(-1) as TimeUnit;
  const timeValue = Number(time.substring(0, time.length - 1));

  if (timeUnit === "m") return timeValue * 60 * MILLIS;
  if (timeUnit === "h") return timeValue * 60 * 60 * MILLIS;
  // day
  return timeValue * 24 * 60 * 60 * MILLIS;
};

interface TimedCacheKey {
  /**
   * @description returns cachekey prefixed with lastTimeFrame timestamp like this `${lastTimeFrame}${cacheKey}`, following this case:
   *  if date.now is greater than lastTimeFrame then
   *    update lastTimeFrame to be date.now + window
   *  otherwise
   *    maintain lastTimeFrame
   */
  getTimedCacheKey: (window: number, cacheKey: string) => string;
  /**
   * @description number representing time window @type {CacheKeyWindow}
   */
  windowTime: number;
}

/**
 * returns TimedCacheKey
 */
export const createFrameCacheKey = (
  numberOfSavedCacheKeys: number,
  time: CacheKeyWindow,
): TimedCacheKey => {
  const cacheKeyMap = LRU<string, number>(numberOfSavedCacheKeys);
  const windowTime = getWindowCacheFromTimeUnit(time);

  const getTimedCacheKey = (window: number, cacheKey: string) => {
    const now = Date.now();
    const lastTime = cacheKeyMap.get(cacheKey) ?? now + window;
    // cacheKeyMap.set(cacheKey, lastTime);
    const shouldRevalidate = now > lastTime;
    const newTimeKey = shouldRevalidate ? now + window : lastTime;

    cacheKeyMap.set(cacheKey, newTimeKey);
    return `${newTimeKey}${cacheKey}`;
  };
  return { getTimedCacheKey, windowTime };
};
