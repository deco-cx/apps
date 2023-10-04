import { AppContext, State } from "../mod.ts";
import { setupProductsIndices } from "../utils/product.ts";

type Props = Partial<State>;

const action = async (props: Props, _req: Request, ctx: AppContext) => {
  const { adminApiKey, applicationId } = props;
  if (!adminApiKey || !applicationId) {
    return "Missing Keys/AppId";
  }

  try {
    await setupProductsIndices({ adminApiKey, applicationId }, ctx.client);
    return "Setup finished successfuly";
  } catch (error) {
    return `Setup finished with error: ${error}`;
  }
};

export default action;
