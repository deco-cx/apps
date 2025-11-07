import { AppContext } from "../mod.ts";
import type { Client } from "../utils/client.ts";
import { SingleObjectResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  path: string;
}

// Tipo auxiliar para incluir decoded_content
// Usando intersection ao invés de extends

type RepoFileContent =
  & Client["GET /repos/:owner/:repo/contents/:path"]["response"]
  & {
    decoded_content?: string;
  };

/**
 * @name GET_REPO_FILE_CONTENT
 * @title Get Repository File Content
 * @description Fetches the content of a file from a GitHub repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SingleObjectResponse<RepoFileContent>> => {
  const { owner, repo, path } = props;
  const response = await ctx.client["GET /repos/:owner/:repo/contents/:path"]({
    owner,
    repo,
    path,
  });
  const fileData = await response.json();
  const result: RepoFileContent = { ...fileData };
  if (fileData.content && fileData.encoding === "base64") {
    result.decoded_content = atob(fileData.content.replace(/\n/g, ""));
  }

  return {
    data: result,
    metadata: {},
  };
};

export default loader;
