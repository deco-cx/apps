import type { AppContext } from "../../../mod.ts";

export interface Props {
    /**
     * @title ID do produto
     * @description ID do produto
     */
    productId: number;

    /**
     * @title ID da variante
     * @description ID da variante a ser removida
     */
    id: number;
}

/**
 * @title Remover Variante
 * @description Permite remover uma variante de produto
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
    const { api } = ctx;

    try {
        await api["DELETE /api/v2/products/:productId/variants/:id"]({
            productId: props.productId,
            id: props.id,
        });

        return {
            success: true,
            message: "Variante removida com sucesso",
        };
    } catch (error) {
        console.error("Erro ao remover variante:", error);
        return {
            success: false,
            message: "Erro ao remover variante",
        };
    }
};

export default action; 