import type { AppContext } from "../../mod.ts";

export interface Props {
    /**
     * @title ID do produto
     * @description ID do produto a ser atualizado
     */
    id: number;

    /**
     * @title Nome do produto
     * @description Nome do produto
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
     */
    active?: boolean;

    /**
     * @title Tags do produto
     * @description Lista de tags associadas ao produto, separadas por vírgula
     */
    tag_list?: string;
}

/**
 * @title Atualizar Produto
 * @description Atualiza um produto existente no catálogo da VNDA
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
    const { api } = ctx;

    try {
        await api["PATCH /api/v2/products/:id"]({
            id: props.id,
        }, {
            body: {
                name: props.name,
                reference: props.reference,
                description: props.description,
                active: props.active,
                tag_list: props.tag_list,
            },
        });

        return {
            success: true,
            message: "Produto atualizado com sucesso",
        };
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        return {
            success: false,
            message: "Erro ao atualizar produto",
        };
    }
};

export default action; 