import { AppContext } from "../mod.ts";
import type { SavedRepository } from "../utils/types.ts";

interface Props {
  limit?: number;
}

/**
 * @name LIST_SAVED_REPOS
 * @title Listar Repositórios Salvos
 * @description Lista os repositórios do GitHub salvos pelo usuário.
 */
const loader = async (
  props: Props,
  _req: Request,
  _ctx: AppContext,
): Promise<SavedRepository[]> => {
  // Em uma implementação real, buscaríamos os dados de algum storage
  // Por enquanto, retornamos uma lista mock de exemplo

  const mockRepositories: SavedRepository[] = [
    {
      id: 1,
      full_name: "deco-sites/storefront",
      html_url: "https://github.com/deco-sites/storefront",
      description: "Repositório de exemplo da Deco",
      owner: "deco-sites",
      repo: "storefront",
      savedAt: new Date().toISOString(),
    },
    {
      id: 2,
      full_name: "deco-cx/apps",
      html_url: "https://github.com/deco-cx/apps",
      description: "Repositório de apps da Deco",
      owner: "deco-cx",
      repo: "apps",
      savedAt: new Date().toISOString(),
    },
  ];

  if (props.limit && props.limit > 0) {
    return mockRepositories.slice(0, props.limit);
  }

  return mockRepositories;
};

export default loader;
