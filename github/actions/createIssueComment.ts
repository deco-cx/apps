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
   * @description Nome do repositório onde está a issue
   */
  repo: string;

  /**
   * @title Número da Issue
   * @description Número identificador da issue
   */
  issue_number: number;

  /**
   * @title Conteúdo do comentário
   * @description Texto do comentário (suporta markdown)
   */
  body: string;
}

/**
 * @name CREATE_ISSUE_COMMENT
 * @title Adicionar Comentário
 * @description Adiciona um comentário a uma issue existente.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<IssueComment> => {
  const { owner, repo, issue_number, body } = props;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/comments`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${ctx.access_token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao adicionar comentário: ${error}`);
    }

    const data = await response.json();
    return data as IssueComment;
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    throw error;
  }
};

export default action;
