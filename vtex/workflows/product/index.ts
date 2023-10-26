import { type WorkflowContext, WorkflowGen } from "deco/mod.ts";
import { type VTEXNotificationPayload } from "../../actions/trigger.ts";
import { type AppManifest } from "../../mod.ts";
import { type Product } from "../../../commerce/types.ts";
import { waitForWorkflowCompletion } from "../../../workflows/utils/awaiters.ts";

const PAGE_SIZE = 50;

export default function Index() {
  return function* (ctx: WorkflowContext<AppManifest>): WorkflowGen<void> {
    let products: Product[] = [];
    let page = 1;
    let indexed = 0;

    yield ctx.log("Starting product indexing workflow");

    do {
      yield ctx.log(
        `Product indexing workflow status: ${indexed} products were indexed`,
      );

      products = yield ctx.invoke("vtex/loaders/workflow/products.ts", {
        pagesize: PAGE_SIZE,
        page,
      });

      if (!Array.isArray(products)) break;

      page++;
      indexed += products.length;

      const executions = [];
      for (const product of products) {
        const exec = yield ctx.invoke("workflows/actions/start.ts", {
          // @ts-expect-error vtex trigger is on generated type
          key: "vtex-trigger",
          args: [{ IdSku: product.productID }] as VTEXNotificationPayload[],
        });

        executions.push(exec);
      }

      for (const exec of executions) {
        if (exec.id && exec.status === "running") {
          yield waitForWorkflowCompletion(ctx, exec.id);
        }
      }
    } while (products.length > 0);

    yield ctx.log(
      `Product indexing workflow finished after indexing ${indexed} skus`,
    );
  };
}
