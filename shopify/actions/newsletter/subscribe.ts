import { AppContext } from "../../mod.ts";
import createCustomerAction from "../customer/createCustomer.ts";

type SubscribeCustomerProps = {
  input: {
    email: string;
    emailMarketingConsent : {
      consentUpdatedAt?: string;
      marketingOptInLevel?: string;
      marketingState: string;
    }
    tags: string[];
  };
};


const action = async (
  { input }: SubscribeCustomerProps,
  req: Request,
  ctx: AppContext,
): Promise<{id: string}> => {

  const { id } = await createCustomerAction({ input }, req, ctx)

  return {
    id
  };
};

export default action;
