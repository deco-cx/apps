import { AppContext } from "../mod.ts";
import { LLMModel, TaskCreatedResponse } from "../client.ts";

export interface Props {
  /**
   * @title Task Description
   * @description Describe what the browser agent should do
   */
  task: string;

  /**
   * @title Save Browser Data
   * @description If enabled, the browser cookies and other data will be saved
   * @default false
   */
  saveBrowserData?: boolean;

  /**
   * @title Structured Output JSON
   * @description Optional JSON schema for structured output
   */
  structuredOutputJson?: string;

  /**
   * @title LLM Model
   * @description Choose the AI model to use
   */
  llmModel?: LLMModel;

  /**
   * @title Use Adblock
   * @description Enable ad blocking during browser automation
   * @default true
   */
  useAdblock?: boolean;

  /**
   * @title Use Proxy
   * @description Enable proxy for browser automation (required for captcha solving)
   * @default true
   */
  useProxy?: boolean;
}

/**
 * @title Run Browser Task
 * @description Execute an automated browser task using AI
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TaskCreatedResponse> => {
  const {
    task,
    saveBrowserData,
    structuredOutputJson,
    llmModel,
    useAdblock,
    useProxy,
  } = props;

  const response = await ctx.api["POST /api/v1/run-task"](
    {},
    {
      body: {
        task,
        save_browser_data: saveBrowserData ?? false,
        structured_output_json: structuredOutputJson,
        llm_model: llmModel,
        use_adblock: useAdblock ?? true,
        use_proxy: useProxy ?? true,
      },
    },
  );

  const result = await response.json();
  return result;
};

export default action;
