import type { AppContext } from "../../mod.ts";
import type { Product } from "../../utils/openapi/vnda.openapi.gen.ts";

export interface Props {
    /**
     * @title ID do produto
     * @description ID do produto a ser buscado
     */
    id: number;

    /**
     * @title Códigos de cupons
     * @description Lista de cupons para calcular o desconto do produto
     */
    coupon_codes?: string[];

    /**
     * @title Incluir local no inventário
     * @description Se "true", inclui o nome do local nos inventários das variantes
     */
    include_inventory_place?: boolean;

    /**
     * @title Incluir imagens
     * @description Se "true", inclui todas as imagens do produto
     */
    include_images?: boolean;
}

/**
 * @title Buscar Produto
 * @description Retorna um produto específico do catálogo da VNDA
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<Product | null> => {
    const { api } = ctx;

    try {
        const response = await api["GET /api/v2/products/:id"]({
            id: props.id,
            coupon_codes: props.coupon_codes,
            include_inventory_place: props.include_inventory_place?.toString(),
            include_images: props.include_images?.toString(),
        });

        return response.json();
    } catch (error) {
        console.error("Erro ao buscar produto:", error);
        return null;
    }
};

export default action; 