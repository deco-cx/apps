import type { AppContext } from "../../../mod.ts";

export interface Props {
    /**
     * @title ID do produto
     * @description ID do produto ao qual a imagem será adicionada
     */
    productId: number;

    /**
     * @title URL da imagem
     * @description URL da imagem a ser adicionada
     */
    url: string;

    /**
     * @title IDs das variantes
     * @description IDs das variantes que utilizarão esta imagem
     */
    variant_ids?: number[];
}

export interface CreateImageResponse {
    id?: number;
    url?: string;
    updated_at?: string;
    variant_ids?: number[];
}

/**
 * @title Criar Imagem do Produto
 * @description Cria uma imagem do produto
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<CreateImageResponse | null> => {
    const { api } = ctx;

    try {
        const response = await api["POST /api/v2/products/:productId/images"]({
            productId: props.productId,
        }, {
            body: {
                file_url: props.url,
                variant_ids: props.variant_ids,
            },
        });

        return response;
    } catch (error) {
        console.error("Erro ao criar imagem:", error);
        return null;
    }
};

export default action; 