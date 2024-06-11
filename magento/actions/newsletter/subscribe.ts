import { AppContext } from "../../mod.ts";
import { NewsletterData } from "../../utils/client/types.ts";

interface Props {
  /**
   * @title Email
   */
  email: string;
}

/**
 * @title Magento Integration - Newsletter subscribe
 */

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NewsletterData | null> => {
  const { storeId, clientAdmin, site } = ctx;

  const { email } = props;

  const body = {
    "email": email,
    "store_id": Number(storeId),
  };

  const result = await clientAdmin["POST /rest/:site/V1/newsletter/subscribed"](
    { site },
    { body },
  ).then((res) => res.json());

  if (!result || result.success === false) {
    return null;
  }

  return result;
};

export default loader;
