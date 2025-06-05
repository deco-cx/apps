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
 * @description Retrieves relevant document snippets from the assistant's knowledge base.
 * Returns an array of text snippets from the most relevant documents.
 * The snippets are formatted as JSON objects with the fields:
 * - file_name: The name of the file containing the snippet
 * - pages: The pages of the file containing the snippet
 * - content: The snippet content
 * You can use the 'top_k' parameter to control result count (default: 15).
 * Recommended top_k: a few (5-8) for simple/narrow queries, 10-20 for complex/broad topics.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<QueryResult> => {
  try {
    if (!ctx.namespace) {
      throw new Error("Namespace is required on the context");
    }

    const response = await ctx.client
      ["POST /records/namespaces/:namespace/search"]({
        namespace: ctx.namespace,
      }, {
        body: {
          query: {
            top_k: props.topK ?? 15,
            inputs: {
              text: props.query,
            },
          },
          fields: ctx.fields ?? ["text"],
        },
      });

    const result = await response.json();

    return {
      content: result.result.hits.map((hit) => {
        const text = JSON.stringify(hit.fields);

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
