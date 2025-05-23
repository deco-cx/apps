import { AppContext } from "../mod.ts";
import type { Issue } from "../utils/types.ts";

interface Props {
  /**
   * @title Nome do proprietário
   * @description Nome do usuário ou organização proprietária do repositório
   */
  owner: string;

  /**
   * @title Nome do repositório
   * @description Nome do repositório onde a issue será criada
   */
  repo: string;

  /**
   * @title Título da Issue
   * @description Título descritivo para a issue
   */
  title: string;

  /**
   * @title Corpo da Issue
   * @description Conteúdo detalhado da issue (suporta markdown)
   */
  body?: string;

  /**
   * @title Responsáveis
   * @description Lista de usernames dos responsáveis pela issue
   */
  assignees?: string[];

  /**
   * @title Etiquetas
   * @description Lista de etiquetas para classificar a issue
   */
  labels?: string[];

  /**
   * @title Marco
   * @description ID do marco (milestone) relacionado à issue
   */
  milestone?: number;
}

/**
 * @name CREATE_ISSUE
 * @title Criar Nova Issue
 * @description Cria uma nova issue em um repositório do GitHub.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Issue> => {
  const { owner, repo, title, body, assignees, labels, milestone } = props;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${ctx.access_token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body,
          assignees,
          labels,
          milestone,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao criar issue: ${error}`);
    }

    const data = await response.json();
    return data as Issue;
  } catch (error) {
    console.error("Erro ao criar issue:", error);
    throw error;
  }
};

export default action;
