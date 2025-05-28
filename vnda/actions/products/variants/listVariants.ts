import type { AppContext } from "../../../mod.ts";
import type { Variant } from "../../../utils/openapi/vnda.openapi.gen.ts";

export interface Props {
    /**
     * @title ID do produto
     * @description ID do produto para listar as variantes
     */
    productId: number;
}

/**
 * @title Listar Variantes
 * @description Permite listar as variantes de um produto
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<Variant[] | null> => {
    const { api } = ctx;

    try {
        const response = await api["GET /api/v2/products/:productId/variants"]({
            productId: props.productId,
        });

        return response.json();
    } catch (error) {
        console.error("Erro ao listar variantes:", error);
        return null;
    }
};

export default action; 