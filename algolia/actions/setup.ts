import { AppContext } from "../mod.ts";
import { setupProductsIndices } from "../utils/product.ts";

type Props = Partial<{
  adminApiKey: string;
  applicationId: string;
}>;

const action = async (props: Props, _req: Request, ctx: AppContext) => {
  const { adminApiKey, applicationId } = props;
  if (!adminApiKey || !applicationId) {
    return "Missing Keys/AppId";
  }

  try {
    await setupProductsIndices(applicationId, adminApiKey, ctx.client);
    return "Setup finished successfuly";
  } catch (error) {
    return `Setup finished with error: ${error}`;
  }
};

export default action;
