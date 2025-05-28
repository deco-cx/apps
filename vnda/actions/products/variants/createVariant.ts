import type { AppContext } from "../../../mod.ts";

export interface Props {
    /**
     * @title ID do produto
     * @description ID do produto ao qual a variante será adicionada
     */
    productId: number;

    /**
     * @title SKU
     * @description Código SKU único da variante
     */
    sku: string;

    /**
     * @title Nome da variante
     * @description Nome da variante
     */
    name?: string;

    /**
     * @title Quantidade
     * @description Quantidade em estoque
     */
    quantity: number;

    /**
     * @title Variante principal
     * @description Indica se é a variante principal do produto
     */
    main?: boolean;

    /**
     * @title Largura
     * @description Largura do produto, em centímetros
     */
    width?: number;

    /**
     * @title Altura
     * @description Altura do produto, em centímetros
     */
    height?: number;

    /**
     * @title Comprimento
     * @description Comprimento do produto, em centímetros
     */
    length?: number;

    /**
     * @title Peso
     * @description Massa do produto, em gramas
     */
    weight?: number;

    /**
     * @title Dias de manuseio
     * @description Dias de manuseio da variante
     */
    handling_days?: number;

    /**
     * @title Preço
     * @description Preço da variante
     */
    price: number;

    /**
     * @title Atributos personalizados
     * @description Customização da variante
     */
    custom_attributes?: Record<string, unknown>;

    /**
     * @title Quantidade mínima
     * @description Quantidade mínima para venda
     */
    min_quantity?: number;

    /**
     * @title Ordem
     * @description Ordem de exibição da variante
     */
    norder?: number;

    /**
     * @title Propriedade 1
     * @description Valor da propriedade 1
     */
    property1?: string;

    /**
     * @title Propriedade 2
     * @description Valor da propriedade 2
     */
    property2?: string;

    /**
     * @title Propriedade 3
     * @description Valor da propriedade 3
     */
    property3?: string;

    /**
     * @title Código de barras
     * @description Código de barras da variante
     */
    barcode?: string;
}

export interface CreateVariantResponse {
    id?: number;
    main?: boolean;
    available?: boolean;
    sku?: string;
    name?: string;
    slug?: string;
    min_quantity?: number;
    quantity?: number;
    stock?: number;
    custom_attributes?: Record<string, unknown>;
    properties?: Record<string, unknown>;
    updated_at?: string;
    price?: number;
    installments?: number[];
    available_quantity?: number;
    weight?: number;
    width?: number;
    height?: number;
    length?: number;
    handling_days?: number;
    sale_price?: number;
    image_url?: string;
    product_id?: number;
    norder?: number;
}

/**
 * @title Criar Variante
 * @description Permite criar uma variante de produto
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<CreateVariantResponse | null> => {
    const { api } = ctx;

    try {
        const response = await api["POST /api/v2/products/:productId/variants"]({
            productId: props.productId,
        }, {
            body: {
                sku: props.sku,
                name: props.name,
                quantity: props.quantity,
                main: props.main,
                width: props.width,
                height: props.height,
                length: props.length,
                weight: props.weight,
                handling_days: props.handling_days,
                price: props.price,
                custom_attributes: props.custom_attributes,
                min_quantity: props.min_quantity,
                norder: props.norder,
                property1: props.property1,
                property2: props.property2,
                property3: props.property3,
                barcode: props.barcode,
            },
        });

        return response.json();
    } catch (error) {
        console.error("Erro ao criar variante:", error);
        return null;
    }
};

export default action; 