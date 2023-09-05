import { AppContext } from "../../mod.ts";
import { Data, Variables, query } from "../../utils/queries/subscribe.ts";

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
  _req: Request,
  ctx: AppContext,
): Promise<{id: string}> => {
  const { admin } = ctx;

  const { payload : {customer} }  = await admin.query<Data, Variables>({
    variables: { 
      input:{
        email: input.email,
        emailMarketingConsent: {
          marketingState: input.emailMarketingConsent.marketingState,
          consentUpdatedAt: input.emailMarketingConsent.consentUpdatedAt,
          marketingOptInLevel: input.emailMarketingConsent.marketingOptInLevel
        },
        tags: input.tags
      }
    },
    query,
  });

  return customer;
};

export default action;
