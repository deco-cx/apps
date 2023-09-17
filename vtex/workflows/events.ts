import type { Workflow } from "deco/blocks/workflow.ts";
import type { WorkflowContext, WorkflowGen } from "deco/mod.ts";
import type { Product, ProductLeaf } from "../../commerce/types.ts";
import type { Notification } from "../actions/trigger.ts";
import type { AppManifest } from "../mod.ts";

interface Props {
  product: Workflow[];
}

export default function Index(props: Props) {
  return function* (
    ctx: WorkflowContext<AppManifest>,
    notification?: Notification,
  ): WorkflowGen<void> {
    const idSKU = notification?.idSKU;
    if (!idSKU) {
      throw new Error(`Missing idSKU from notification`);
    }

    // TODO: This is subjected to cache. For a real indexing
    // we need to create a function that fetches and transforms a
    // product without any cache. This may require an API key
    const products = yield ctx.invoke(
      "vtex/loaders/intelligentSearch/productList.ts",
      {
        ids: [idSKU],
        similars: true,
      },
    );

    const [head] = products as Product[];
    const leaf: ProductLeaf | undefined = head?.isVariantOf
      ?.hasVariant?.find((p: ProductLeaf) => p.productID === idSKU);

    if (!leaf) {
      throw new Error("No product returned by Product loader");
    }

    const product: Product = {
      ...leaf,
      isVariantOf: head.isVariantOf && {
        ...head.isVariantOf,
        hasVariant: head.isVariantOf.hasVariant,
      },
    };

    /** Start each registered workflow */
    const workflows = props.product || [];

    for (const workflow of workflows) {
      yield ctx.log(
        "Starting worflow for",
        workflow.key,
        "with productID",
        product.productID,
      );

      yield ctx.invoke("workflows/actions/start.ts", {
        // @ts-expect-error type is not resolving keys somehow
        key: workflow.key,
        props: workflow.props,
        args: [product],
      });
    }
  };
}
