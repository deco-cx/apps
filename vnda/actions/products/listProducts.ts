import type { AppContext } from "../../mod.ts";
import type { Product } from "../../utils/openapi/vnda.openapi.gen.ts";

export interface Props {
    /**
     * @title Limite
     * @description Delimita a quantidade de itens retornados
     */
    limit?: number;

    /**
     * @title Número da página
     * @description Número da página
     */
    page?: number;

    /**
     * @title Produtos por página
     * @description Quantidade de produtos por página
     */
    per_page?: number;

    /**
     * @title Referência
     * @description Filtra pela referência
     */
    reference?: string;

    /**
     * @title IDs dos produtos
     * @description Filtra pelo ID dos produtos
     */
    ids?: string[];

    /**
     * @title Tag
     * @description Filtra produtos que contêm a tag
     */
    tag?: string;

    /**
     * @title Atualizado após
     * @description Filtra produtos alterados depois da data (formato: YYYY-MM-DD)
     */
    updated_after?: string;

    /**
     * @title Ordenação
     * @description Exibe os produtos cadastrados recentemente primeiro
     */
    sort?: "newest";

    /**
     * @title Incluir inativos
     * @description Inclui os produtos inativos na listagem
     */
    include_inactive?: boolean;

    /**
     * @title Incluir imagens
     * @description Inclui todas as imagens do produto
     */
    include_images?: boolean;
}

/**
 * @title Listar Produtos
 * @description Lista os produtos do catálogo da VNDA
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<Product[] | null> => {
    const { api } = ctx;

    try {
        const response = await api["GET /api/v2/products"]({
            limit: props.limit,
            page: props.page,
            per_page: props.per_page,
            reference: props.reference,
            ids: props.ids,
            tag: props.tag,
            updated_after: props.updated_after,
            sort: props.sort,
            include_inactive: props.include_inactive,
            include_images: props.include_images,
        });

        return response.json();
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        return null;
    }
};

export default action; 