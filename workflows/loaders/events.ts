import { history } from "../initializer.ts";
import { HistoryEvent, Pagination } from "@deco/durable";
import { StreamProps } from "@deco/deco";
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
