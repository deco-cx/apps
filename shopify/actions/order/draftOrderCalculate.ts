import { AppContext } from "../../mod.ts";
import { Data, Variables, query } from "../../utils/queries/draftOrderCalculate.ts";

type DraftOrderCalculateProps = {
  input: {
    lineItems: {
        variantId: string;
        quantity: number;
    }[];
    shippingAddress:{
        zip: string;
        countryCode: string;
        province: string;
    }
  };
};

const action = async (
  { input }: DraftOrderCalculateProps,
  _req: Request,
  ctx: AppContext,
): Promise<Data['payload']['calculatedDraftOrder']> => {
  const { admin } = ctx;

  const {payload : { calculatedDraftOrder }}  = await admin.query<Data, Variables>({
    variables: { 
      input:{
        lineItems: [...input.lineItems],
        shippingAddress: {
            zip: input.shippingAddress.zip,
            countryCode: input.shippingAddress.countryCode,
            province: input.shippingAddress.province,
        },
      }
    },
    query,
  });

  return calculatedDraftOrder;
};

export default action;
