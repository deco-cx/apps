import { AppContext } from "../../mod.ts";
import { handleTaskCreationResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Keywords
   * @description Seed keywords to get related suggestions
   */
  keywords: string[];

  /**
   * @title Language Name
   * @description Language for the keywords (e.g., "English", "Portuguese")
   */
  language_name?: string;

  /**
   * @title Location Name
   * @description Location for keyword data (e.g., "United States", "Brazil")
   */
  location_name?: string;

  /**
   * @title Limit
   * @description Maximum number of related keywords to return
   */
  limit?: number;

  /**
   * @title Include Seed Keyword
   * @description Include seed keywords in results
   */
  include_seed_keyword?: boolean;
}

/**
 * @name CREATE_RELATED_KEYWORDS_TASK
 * @title Create Related Keywords Task
 * @description Create a task to find keyword suggestions related to seed keywords
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client
    ["POST /keywords_data/google/related_keywords/task_post"](
      {},
      {
        body: [{
          keywords: props.keywords,
          language_name: props.language_name,
          location_name: props.location_name,
          limit: props.limit,
          include_seed_keyword: props.include_seed_keyword,
        }],
      },
    );
  return await handleTaskCreationResponse(response, "Palavras Relacionadas");
}
