import { AppContext } from "../../mod.ts";

import { draftOrderCalculate } from "../../utils/admin/queries.ts";

import {
    CalculatedDraftOrder,
    MutationDraftOrderCalculateArgs,
    DraftOrderCalculatePayload,
Maybe,
CountryCode
  } from "../../utils/admin/admin.graphql.gen.ts";

type DraftOrderCalculateProps = {
  input: {
    lineItems: {
        variantId: string;
        quantity: number;
    }[];
    shippingAddress:{
        zip: string;
        countryCode: CountryCode;
        provinceCode: string;
    }
  };
};

const action = async (
  { input }: DraftOrderCalculateProps,
  _req: Request,
  ctx: AppContext,
): Promise<Maybe<CalculatedDraftOrder> | undefined> => {
  const { admin } = ctx;

  console.log("entrou")

  const { calculatedDraftOrder } = await admin.query<
  DraftOrderCalculatePayload,
  MutationDraftOrderCalculateArgs
  >({
    variables: { 
        input:{
        lineItems: [...input.lineItems],
        shippingAddress: {
            zip: input.shippingAddress.zip,
            countryCode: input.shippingAddress.countryCode,
            provinceCode: input.shippingAddress.provinceCode,
        },
      } 
    },
    ...draftOrderCalculate,
  });
  

  return calculatedDraftOrder;
};

export default action;