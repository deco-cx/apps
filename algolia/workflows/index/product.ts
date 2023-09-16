import { WorkflowContext, WorkflowGen } from "deco/mod.ts";
import { Product } from "../../../commerce/types.ts";
import type { Manifest } from "../../manifest.gen.ts";

export default function Index(_: unknown) {
  return function* (
    ctx: WorkflowContext<Manifest>,
    product: Product,
  ): WorkflowGen<void> {
    const type = product?.["@type"];
    const productID = product?.productID;

    if (type !== "Product" || !productID) {
      throw new Error(`Workflow input expected Product but received ${type}`);
    }

    yield ctx.log("Started indexing Product:", productID);

    const taskID = yield ctx.invoke(
      "algolia/actions/index/product.ts",
      { product },
    );

    if (typeof taskID === 'number') {
      yield ctx.invoke(
        "algolia/actions/index/wait.ts",
        { taskID },
      );
    }

    yield ctx.log("Finished indexing Product:", productID);
  };
}
