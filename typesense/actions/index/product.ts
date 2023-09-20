import { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { toIndex } from "../../utils/product.ts";

interface Props {
  product: Product;
  action: "DELETE" | "UPSERT";
}

const action = async (props: Props, _req: Request, ctx: AppContext) => {
  const { product, action } = props;

  const indexProduct = toIndex(product);

  const { admin } = await ctx.products();

  if (action === "UPSERT") {
    await admin.documents().upsert(indexProduct);
  }

  if (action === "DELETE") {
    await admin.documents().delete(indexProduct.id);
  }
};

export default action;
