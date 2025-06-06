import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @description Query to search for
   */
  query: string;

  /**
   * @description The number of context snippets to retrieve. Defaults to 15.
   */
  topK?: number;
}

interface QueryResult {
  content: {
    type: string;
    text: string;
  }[];
}

/**
 * @title Get Context
 * @description Retrieves relevant document snippets from the assistant's knowledge base.Returns an array of text snippets from the most relevant documents. The snippets are formatted as JSON objects with the fields: - file_name: The name of the file containing the snippet - pages: The pages of the file containing the snippet - content: The snippet content You can use the 'top_k' parameter to control result count (default: 15). Recommended top_k: a few (5-8) for simple/narrow queries, 10-20 for complex/broad topics.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<QueryResult> => {
  try {
    const response = await ctx.client
      ["POST /assistant/chat/:assistant_name/context"]({
        assistant_name: ctx.assistant,
      }, {
        body: {
          query: props.query,
        },
      });

    const result = await response.json();

    return {
      content: result.snippets.map((snippet) => {
        const text = JSON.stringify({
          file_name: snippet.reference.file.name,
          pages: snippet.reference.pages,
          content: snippet.content,
        });

        return {
          type: "text",
          text,
        };
      }),
    };
  } catch (error) {
    throw error;
  }
};

export default action;
