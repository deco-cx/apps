import { AppContext } from "../mod.ts";
import { ResponseWriteReview, WriteReview } from "../utils/types.ts";
import { logger } from "@deco/deco/o11y";

export interface Props {
  /**
   * @title Product Id
   */
  sku: string;
  review: WriteReview;
}

export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ResponseWriteReview | null> {
  const { customer, api } = ctx;
  const { review, sku } = props;

  try {
    const response = await api[`POST /:customer/:sku/review`]({
      sku: sku,
      customer,
    }, {
      body: {
        ...review,
      },
    }).then((r) => r.json());
    return await response;
  } catch (error) {
    const errorObj = error as { name: string; message: string };
    logger.error(`{ errorName: ${errorObj.name},  
    errorMessage: ${errorObj.message} }`);
    return null;
  }
}
