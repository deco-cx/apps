import type { Workflow } from "deco/blocks/workflow.ts";
import type { WorkflowContext, WorkflowGen } from "deco/mod.ts";
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

    const {
      IdSku,
      HasStockKeepingUnitRemovedFromAffiliate,
      IsActive,
    } = notification;

    const action = HasStockKeepingUnitRemovedFromAffiliate || !IsActive
      ? "DELETE"
      : "UPSERT";

    const product = yield ctx.invoke("vtex/loaders/product.ts", {
      productID: IdSku,
    });

    if (!product) {
      throw new Error(`No product returned by Product loader ${IdSku}`);
    }

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
        args: [product, action],
      });
    }
  };
}
