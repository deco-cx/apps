import { AppContext } from "../mod.ts";
import type { Repository, SavedRepository } from "../utils/types.ts";

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
}

/**
 * @name ADD_REPOSITORY
 * @title Adicionar Repositório
 * @description Adiciona um repositório do GitHub às preferências.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SavedRepository> => {
  const { owner, repo } = props;

  // Buscar informações do repositório na API do GitHub
  const response = await ctx.client["GET /repos/:owner/:repo/contents/:path"]({
    owner,
    repo,
    path: "",
  });

  if (!response.ok) {
    throw new Error(`Repositório ${owner}/${repo} não encontrado`);
  }

  // Aqui poderíamos salvar o repositório em algum storage persistente
  // Por simplicidade, apenas retornamos o objeto que seria salvo

  const savedRepo: SavedRepository = {
    id: Date.now(), // Usar timestamp como ID
    full_name: `${owner}/${repo}`,
    html_url: `https://github.com/${owner}/${repo}`,
    owner,
    repo,
    savedAt: new Date().toISOString(),
    // Se necessário, podemos buscar mais informações do repositório através de outro endpoint
  };

  return savedRepo;
};

export default action;
