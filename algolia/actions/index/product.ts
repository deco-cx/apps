import { ApiError } from "npm:@algolia/transporter@4.20.0";
import { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { Indices, toIndex } from "../../utils/product.ts";

interface Props {
  product: Product;
  action: "DELETE" | "UPSERT";
}

// deno-lint-ignore no-explicit-any
const isAPIError = (x: any): x is ApiError =>
  typeof x?.status === "number" &&
  x.name === "ApiError";

const indexName: Indices = "products";

const action = async (props: Props, _req: Request, ctx: AppContext) => {
  const { product, action } = props;
  const { client } = ctx;

  try {
    const indexProduct = toIndex(product);

    const { taskID } = action === "UPSERT"
      ? await client.initIndex(indexName).saveObject(indexProduct, {
        autoGenerateObjectIDIfNotExist: false,
      })
      : await client.initIndex(indexName).deleteObject(indexProduct.objectID);

    return taskID;
  } catch (error) {
    console.error(error);

    if (isAPIError(error) && error.status === 400) {
      return null;
    }

    throw error;
  }
};

export default action;
