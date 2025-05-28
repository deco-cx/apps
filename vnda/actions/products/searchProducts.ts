import type { AppContext } from "../../mod.ts";
import type { ProductSearch } from "../../utils/openapi/vnda.openapi.gen.ts";

export interface Props {
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
     * @title Termo de busca
     * @description Filtra produtos que contenham o termo
     */
    term?: string;

    /**
     * @title Busca parcial
     * @description Permite que o filtro 'term' realize filtragem por termo parcial
     */
    wildcard?: boolean;

    /**
     * @title IDs dos produtos
     * @description Filtra pelo ID dos produtos
     */
    ids?: number[];

    /**
     * @title Tags de tipo
     * @description Filtra pelo nome da tag dentro de um tipo de tag
     */
    type_tags?: Record<string, string>;

    /**
     * @title Operador lógico de tags
     * @description Operador lógico para o filtro de tag
     */
    type_tags_operator?: "and" | "or";

    /**
     * @title Valores da propriedade 1
     * @description Filtra pelo valor da propriedade 1
     */
    property1_values?: string[];

    /**
     * @title Operador propriedade 1
     * @description Operador lógico para o filtro de valor da propriedade 1
     */
    property1_operator?: "and" | "or";

    /**
     * @title Valores da propriedade 2
     * @description Filtra pelo valor da propriedade 2
     */
    property2_values?: string[];

    /**
     * @title Operador propriedade 2
     * @description Operador lógico para o filtro de valor da propriedade 2
     */
    property2_operator?: "and" | "or";

    /**
     * @title Valores da propriedade 3
     * @description Filtra pelo valor da propriedade 3
     */
    property3_values?: string[];

    /**
     * @title Operador propriedade 3
     * @description Operador lógico para o filtro de valor da propriedade 3
     */
    property3_operator?: "and" | "or";

    /**
     * @title Preço mínimo
     * @description Filtra por preço mínimo
     */
    min_price?: number;

    /**
     * @title Preço máximo
     * @description Filtra por preço máximo
     */
    max_price?: number;

    /**
     * @title Tags
     * @description Filtra pelo nome das tags, independente do tipo
     */
    tags?: string[];

    /**
     * @title Tags pai
     * @description Filtra pelo nome das tags pai, independente do tipo
     */
    parent_tags?: string[];

    /**
     * @title Apenas disponíveis
     * @description Filtra por produtos disponíveis
     */
    show_only_available?: boolean;

    /**
     * @title Ordenação
     * @description Campo para ordenação dos resultados
     */
    sort?: "newest" | "oldest" | "lowest_price" | "highest_price";
}

/**
 * @title Buscar Produtos
 * @description Busca produtos no catálogo da VNDA de acordo com os parâmetros definidos
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
) => {
    const { api } = ctx;

    try {
        // Criar objeto de parâmetros apenas com valores definidos
        const searchParams: Record<string, unknown> = {};

        // Adicionar apenas parâmetros que não são undefined ou null
        if (props.page !== undefined) searchParams.page = props.page;
        if (props.per_page !== undefined) searchParams.per_page = props.per_page;
        if (props.term !== undefined && props.term !== "") searchParams.term = props.term;
        if (props.wildcard !== undefined) searchParams.wildcard = props.wildcard;
        if (props.ids !== undefined && props.ids.length > 0) searchParams["ids[]"] = props.ids;
        if (props.type_tags !== undefined && Object.keys(props.type_tags).length > 0) {
            searchParams["type_tags[]"] = props.type_tags;
        }
        if (props.type_tags_operator !== undefined) searchParams.type_tags_operator = props.type_tags_operator;
        if (props.property1_values !== undefined && props.property1_values.length > 0) {
            searchParams["property1_values[]"] = props.property1_values;
        }
        if (props.property1_operator !== undefined) searchParams.property1_operator = props.property1_operator;
        if (props.property2_values !== undefined && props.property2_values.length > 0) {
            searchParams["property2_values[]"] = props.property2_values;
        }
        if (props.property2_operator !== undefined) searchParams.property2_operator = props.property2_operator;
        if (props.property3_values !== undefined && props.property3_values.length > 0) {
            searchParams["property3_values[]"] = props.property3_values;
        }
        if (props.property3_operator !== undefined) searchParams.property3_operator = props.property3_operator;
        if (props.min_price !== undefined) searchParams.min_price = props.min_price;
        if (props.max_price !== undefined) searchParams.max_price = props.max_price;
        if (props.tags !== undefined && props.tags.length > 0) searchParams["tags[]"] = props.tags;
        if (props.parent_tags !== undefined && props.parent_tags.length > 0) {
            searchParams.parent_tags = props.parent_tags;
        }
        if (props.show_only_available !== undefined) searchParams.show_only_available = props.show_only_available;
        if (props.sort !== undefined) searchParams.sort = props.sort;

        const response = await api["GET /api/v2/products/search"](searchParams as any);

        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);

        // Log detalhado do erro para debugging
        if (error instanceof Error) {
            console.error("Detalhes do erro:", {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }

        return null;
    }
};

export default action; 