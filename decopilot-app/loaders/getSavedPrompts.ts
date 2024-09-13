import { AppContext } from "../mod.ts";
import { Prompt } from "../types.ts";

interface Props {
  agentName: string;
}

/**
 * @title Decopilot App - Get Saved Prompt
 * @description Retrieves a saved prompt from app array
 */
const loader = (
  props: Props,
  _request: Request,
  ctx: AppContext,
): Prompt | null => {
  const foundPrompt = ctx.content.find(({ agentName }) =>
    agentName === props.agentName
  );
  return foundPrompt || null; // Return null if no prompt is found
};

export default loader;
