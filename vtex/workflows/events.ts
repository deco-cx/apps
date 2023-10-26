import type { Workflow } from "deco/blocks/workflow.ts";
import type { WorkflowContext, WorkflowGen } from "deco/mod.ts";
import type { Product } from "../../commerce/types.ts";
import { waitForWorkflowCompletion } from "../../workflows/utils/awaiters.ts";
import type { VTEXNotificationPayload } from "../actions/trigger.ts";
import type { AppManifest } from "../mod.ts";

interface Props {
  product: Workflow[];
}

export default function Index(props: Props) {
  return function* (
    ctx: WorkflowContext<AppManifest>,
    notification?: VTEXNotificationPayload,
  ): WorkflowGen<void> {
    if (!notification?.IdSku) {
      throw new Error(`Missing idSKU from notification`);
    }

    const { IdSku, HasStockKeepingUnitRemovedFromAffiliate } = notification;

    const product = yield ctx.invoke("vtex/loaders/workflow/product.ts", {
      productID: IdSku,
    });

    const action = HasStockKeepingUnitRemovedFromAffiliate || !product
      ? "DELETE"
      : "UPSERT";

    /** Start each registered workflow */
    const workflows = props.product || [];

    for (const workflow of workflows) {
      const p: Product = product || {
        "@type": "Product",
        sku: IdSku,
        productID: IdSku,
      };

      yield ctx.log(
        "Starting worflow for",
        workflow.key,
        "with productID",
        p.productID,
      );

      const exec = yield ctx.invoke("workflows/actions/start.ts", {
        // @ts-expect-error type is not resolving keys somehow
        key: workflow.key,
        props: workflow.props,
        args: [p, action],
      });

      if (exec.id && exec.status === "running") {
        yield waitForWorkflowCompletion(ctx, exec.id);
      }
    }
  };
}
