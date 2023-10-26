import { WorkflowContext, WorkflowGen } from "deco/mod.ts";
import { Product } from "../../../commerce/types.ts";
import type { Manifest } from "../../manifest.gen.ts";

/**
 * @title Algolia integration - Product Event
 */
export default function Index(_: unknown) {
  return function* (
    ctx: WorkflowContext<Manifest>,
    product: Product,
    action: "UPSERT" | "DELETE",
  ): WorkflowGen<void> {
    const type = product?.["@type"];
    const productID = product?.productID;
    const name = product?.name;
    const groupName = product?.isVariantOf?.name;

    if (type !== "Product" || !productID) {
      throw new Error(`Workflow input expected Product but received ${type}`);
    }

    yield ctx.log(
      "[Algolia] Started indexing Product:",
      { productID, name, groupName, action },
    );

    const taskID = yield ctx.invoke(
      "algolia/actions/index/product.ts",
      { product, action },
    );

    if (typeof taskID === "number") {
      yield ctx.invoke(
        "algolia/actions/index/wait.ts",
        { taskID },
      );
    }

    yield ctx.log(
      "[Algolia] Finished indexing Product:",
      { productID, name, groupName, action },
    );
  };
}
