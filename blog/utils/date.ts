/** An ISO 8601 date or date-time carrying no timezone designator. */
const ISO_WITHOUT_TIMEZONE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?)?$/;

/**
 * Parses a CMS-authored date or date-time into a timestamp.
 *
 * `BlogPost.date` may be a bare `YYYY-MM-DD` or a full ISO 8601 timestamp, and
 * `scheduledDatetime` is a date-time that may or may not carry an offset.
 *
 * Anything without a timezone designator is pinned to UTC, so the result never
 * depends on the machine timezone. That matters for both shapes: per spec a
 * bare date is already UTC, but an offset-less datetime is parsed as *local*
 * time, which would otherwise reorder posts near a day boundary from one
 * server to the next — and, for a scheduled post, move its go-live instant.
 *
 * Unparseable values fall back to 0 instead of leaking NaN into a comparator
 * (a NaN result is treated as 0, so the post would never move). Callers that
 * compare against "now" must reject 0 explicitly rather than let it through as
 * a very old date.
 */
export const dateToTime = (date: string) =>
  new Date(
    ISO_WITHOUT_TIMEZONE.test(date)
      ? `${date.includes("T") ? date : `${date}T00:00:00`}Z`
      : date,
  ).getTime() || 0;
