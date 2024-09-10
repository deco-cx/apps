import { Arg } from "deco/deps.ts";
import { get } from "../initializer.ts"; // side-effect initialize
import { toExecution, WorkflowExecution, WorkflowMetadata } from "../types.ts";
export interface Props {
  id: string;
}

/**
 * @description Read the workflow execution information.
 */
export default function getExecution(
  { id }: Props,
): Promise<WorkflowExecution | null> {
  return get<Arg, unknown, WorkflowMetadata>(id).then((wkflow) =>
    wkflow ? toExecution(wkflow) : wkflow
  );
}
