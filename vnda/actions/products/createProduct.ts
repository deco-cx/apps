import type { AppContext } from "../../mod.ts";

export interface Props {
    /**
     * @title Nome do produto
     * @description Nome do produto a ser criado
     */
    name: string;

    /**
     * @title Referência do produto
     * @description Código de referência único do produto
     */
    reference: string;

    /**
     * @title Descrição do produto
     * @description Descrição detalhada do produto
     */
    description?: string;

    /**
     * @title Produto ativo
     * @description Indica se o produto está ativo (true) ou inativo (false)
     * @default true
     */
    active?: boolean;

    /**
     * @title Tags do produto
     * @description Lista de tags associadas ao produto, separadas por vírgula
     */
    tag_list?: string;
}

export interface CreateProductResponse {
    id?: number;
    /**
     * Indica se o produto está ativo (true) ou inativo (false)
     */
    active?: boolean | string;
    /**
     * Código de Referência do produto
     */
    reference: string;
    /**
     * Nome do produto
     */
    name: string;
    /**
     * Descrição do produto
     */
    description?: string;
    /**
     * Lista de tags associadas ao produto
     */
    tag_list?: string[];
    slug?: string;
    url?: string;
    updated_at?: string;
    /**
     * Tipo de produto, entre:
     *   - `sample`: amostra
     *   - `subscription`: assinatura
     *   - `product`: produto em geral
     */
    product_type?: "product" | "sample" | "subscription";
}

/**
 * @title Criar Produto
 * @description Cria um novo produto no catálogo da VNDA
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<CreateProductResponse | null> => {
    const { api } = ctx;

    try {
        const response = await api["POST /api/v2/products"]({}, {
            body: {
                name: props.name,
                reference: props.reference,
                description: props.description,
                active: props.active ?? true,
                tag_list: props.tag_list,
            }
        }).then((res) => res.json());

        return response;
    } catch (error) {
        console.error("Erro ao criar produto:", error);
        return null;
    }
};

export default action; 