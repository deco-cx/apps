import type { AppContext } from "../../mod.ts";

export interface Props {
    /**
     * @title ID do produto
     * @description ID do produto a ser avaliado
     */
    id: number;

    /**
     * @title Avaliação
     * @description Nota da avaliação (1 a 5)
     * @minimum 1
     * @maximum 5
     */
    rate: number;
}

export interface RateProductResponse {
    rating?: string;
    votes?: string;
}

/**
 * @title Avaliar Produto
 * @description Recebe uma avaliação e recalcula a pontuação atual do produto
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<RateProductResponse | null> => {
    const { api } = ctx;

    try {
        const response = await api["POST /api/v2/products/:id/rate"]({
            id: props.id,
            rate: props.rate,
        });

        return response.json();
    } catch (error) {
        console.error("Erro ao avaliar produto:", error);
        return null;
    }
};

export default action; 