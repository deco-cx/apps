import type { AppContext } from "../../mod.ts";

export interface Props {
    /**
     * @title Referência do produto
     * @description Referência do produto a ser atualizado
     */
    reference: string;

    /**
     * @title Nova referência
     * @description Nova referência do produto
     */
    new_reference: string;

    /**
     * @title Nome do produto
     * @description Nome do produto
     */
    name: string;

    /**
     * @title Descrição do produto
     * @description Descrição detalhada do produto
     */
    description?: string;

    /**
     * @title Produto ativo
     * @description Indica se o produto está ativo (true) ou inativo (false)
     */
    active?: boolean;

    /**
     * @title Tipo de produto
     * @description Tipo de produto: product (padrão), sample (amostra) ou subscription (assinatura)
     */
    product_type?: "product" | "sample" | "subscription";
}

/**
 * @title Atualizar Produto por Referência
 * @description Permite atualizar um produto pela referência
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
    const { api } = ctx;

    try {
        await api["PATCH /api/v2/products/reference/:reference"]({
            reference: props.reference,
        }, {
            body: {
                reference: props.new_reference,
                name: props.name,
                description: props.description,
                active: props.active,
                product_type: props.product_type,
            },
        });

        return {
            success: true,
            message: "Produto atualizado com sucesso",
        };
    } catch (error) {
        console.error("Erro ao atualizar produto por referência:", error);
        return {
            success: false,
            message: "Erro ao atualizar produto",
        };
    }
};

export default action; 