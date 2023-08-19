import type {
  HistoryEvent,
  Pagination,
} from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/deps.ts";
import { StreamProps } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/utils/invoke.ts";
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
