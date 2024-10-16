import { dayjs } from "../deps/deps.ts";

export function dateInSeconds(date: string | Date) {
  return Math.floor(
    new Date(date).getTime() / 1000,
  );
}

export function isToday(date: string | Date) {
  const now = new Date(date);
  const endOfDay = dayjs().endOf("day");
  const startOfDay = dayjs().startOf("day");

  return startOfDay.isBefore(now) && endOfDay.isAfter(now);
}
