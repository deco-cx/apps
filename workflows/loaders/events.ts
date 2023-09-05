import type { HistoryEvent, Pagination } from "deco/deps.ts";
import { StreamProps } from "deco/utils/invoke.ts";
import { history } from "../initializer.ts"; // side-effect initialize

export interface Props extends StreamProps {
  id: string;
  page?: number;
  pageSize?: number;
}

export type Events =
  | Pagination<HistoryEvent>
  | AsyncIterableIterator<HistoryEvent>;

/**
 * @description Get the workflow execution events.
 */
export default function getExecutionEvents(
  { id, ...rest }: Props,
): Promise<Events> {
  return history(id, rest);
}
