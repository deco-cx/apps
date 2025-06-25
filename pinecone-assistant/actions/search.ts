import { AppContext } from "../mod.ts";
export interface Props {
  /**
   * @description Query to search for
   */
  query: string;

  /**
   * @description The user prompt to be answered by the assistant after the search
   */
  userPrompt: string;

  /**
   * @description The number of context snippets to retrieve. Defaults to 15.
   */
  topK?: number;
}

interface QueryResult {
  answer: string;
}

/**
 * @title _ws_Get Context
 * @name _ws_Get Context
 * @description Retrieves relevant document snippets from the assistant's knowledge base.Returns an array of text snippets from the most relevant documents. The snippets are formatted as JSON objects with the fields: - file_name: The name of the file containing the snippet - pages: The pages of the file containing the snippet - content: The snippet content You can use the 'top_k' parameter to control result count (default: 15). Recommended top_k: a few (5-8) for simple/narrow queries, 10-20 for complex/broad topics.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<QueryResult> => {
  try {
    console.time("search");
    const searchResponse = await ctx.client
      ["POST /assistant/chat/:assistant_name/context"]({
        assistant_name: ctx.assistant,
      }, {
        body: {
          query: props.query,
        },
      });

    console.timeEnd("search");

    console.time("searchResult");
    const searchResult = await searchResponse.json();
    console.timeEnd("searchResult");

    console.time("searchResultText");
    const searchResultText = searchResult.snippets.map((snippet) => {
      return JSON.stringify({
        file_name: snippet.reference.file.name,
        pages: snippet.reference.pages,
        content: snippet.content,
      });
    }).join("\n");
    console.timeEnd("searchResultText");
    console.time("createMessage");

    const result = await ctx.mcpServer.server.createMessage({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: searchResultText,
          },
        },
      ],
      modelPreferences: {
        hints: [
          {
            name: "gpt-4.1-mini",
          },
        ],
      },
      maxTokens: 1000,
    });
    console.timeEnd("createMessage");

    console.log({ result });

    return {
      answer: result.content.text,
    };
  } catch (error) {
    throw error;
  }
};

export default action;
