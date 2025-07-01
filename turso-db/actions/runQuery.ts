import { AppContext } from "../mod.ts";
import { SQLParameter, TursoResponse } from "../client.ts";

export interface Result {
  columns?: string[];
  // deno-lint-ignore no-explicit-any
  rows?: Array<Array<any>>;
  affected_row_count?: number;
  last_insert_rowid?: string;
  error?: {
    message: string;
    code: string;
  };
}

export interface Props {
  /**
   * @title SQL Query
   * @description SQL statement to execute
   */
  sql: string;

  /**
   * @title Parameters
   * @description Optional parameters for the SQL query (positional)
   */
  params?: SQLParameter[];
}

/**
 * @title Run SQL Query
 * @description Execute a SQL query against your Turso database
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Result> => {
  const { sql, params } = props;

  try {
    // Prepare the request payload
    const response = await ctx.api["POST /v2/pipeline"](
      {},
      {
        body: {
          requests: [
            {
              type: "execute",
              stmt: {
                sql,
                args: params,
              },
            },
            { type: "close" },
          ],
        },
      },
    );

    // Parse the response
    const result: TursoResponse = await response.json();

    // Return the first result
    return result.results[0] || {};
  } catch (error: unknown) {
    console.error("Error executing SQL query:", error);
    return {
      error: {
        message: error instanceof Error
          ? error.message
          : "Failed to execute SQL query",
        code: "EXECUTION_ERROR",
      },
    };
  }
};

export default action;
