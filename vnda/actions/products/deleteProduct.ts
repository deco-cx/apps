import type { AppContext } from "../../mod.ts";

export interface Props {
    /**
     * @title ID do produto
     * @description ID do produto a ser deletado
     */
    id: number;
}

/**
 * @title Deletar Produto
 * @description Remove um produto do catálogo da VNDA
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
    const { api } = ctx;

    try {
        await api["DELETE /api/v2/products/:id"]({
            id: props.id,
        });

        return {
            success: true,
            message: "Produto deletado com sucesso",
        };
    } catch (error) {
        console.error("Erro ao deletar produto:", error);
        return {
            success: false,
            message: "Erro ao deletar produto",
        };
    }
};

export default action; 