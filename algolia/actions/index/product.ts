import { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";

interface Props {
  product: Product;
}

const action = async (props: Props, _req: Request, ctx: AppContext) => {
  const { algolia } = ctx;
  const { product } = props;

  try {
    const index = await algolia("products");

    const refedProduct = {
      ...product,
      objectID: product.productID,
      isVariantOf: {
        ...product.isVariantOf,
        hasVariant: product.isVariantOf?.hasVariant.map((p) => ({
          productID: p.productID,
        })),
      },
      isSimilarTo: product.isSimilarTo?.map((p) => ({
        productID: p.productID,
      })),
    };

    const { taskID } = await index.saveObject(refedProduct, {
      autoGenerateObjectIDIfNotExist: false,
    });

    return taskID;
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
