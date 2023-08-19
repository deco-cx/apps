import { Arg } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/deps.ts";
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
