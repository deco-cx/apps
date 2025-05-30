import { AppContext } from "../mod.ts";
import type { IssueComment } from "../utils/types.ts";

interface Props {
  /**
   * @title Nome do proprietário
   * @description Nome do usuário ou organização proprietária do repositório
   */
  owner: string;

  /**
   * @title Nome do repositório
   * @description Nome do repositório
   */
  repo: string;

  /**
   * @title Número da Issue
   * @description Número identificador da issue
   */
  issue_number: number;

  /**
   * @title Itens por página
   * @description Número de comentários por página
   */
  per_page?: number;

  /**
   * @title Página
   * @description Número da página para paginação
   */
  page?: number;
}

/**
 * @name GET_ISSUE_COMMENTS
 * @title Comentários da Issue
 * @description Lista os comentários de uma issue específica.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<IssueComment[]> => {
  const { owner, repo, issue_number, ...params } = props;

  const response = await ctx.client
    ["GET /repos/:owner/:repo/issues/:issue_number/comments"]({
      owner,
      repo,
      issue_number,
      ...params,
    });

  if (!response.ok) {
    throw new Error(`Falha ao buscar comentários da issue #${issue_number}`);
  }

  return await response.json();
};

export default loader;
