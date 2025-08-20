import { AppContext } from "../../mod.ts";

import { draftOrderCalculate } from "../../utils/admin/queries.ts";

import {
  CalculatedDraftOrder,
  DraftOrderCalculatePayload,
} from "../../utils/admin/admin.ts";

import {
  CountryCode,
  Maybe,
} from "../../utils/storefront/storefront.graphql.gen.ts";

type DraftOrderCalculateProps = {
  input: {
    lineItems: {
      variantId: string;
      quantity: number;
    }[];
    shippingAddress: {
      zip: string;
      countryCode: CountryCode;
      provinceCode?: string;
    };
  };
};

/** The schema's entry point for all mutation operations. */
type MutationDraftOrderCalculateArgs = {
  input: DraftOrderCalculateProps["input"];
};

const action = async (
  { input }: DraftOrderCalculateProps,
  _req: Request,
  ctx: AppContext,
): Promise<Maybe<CalculatedDraftOrder> | undefined> => {
  const { admin, address } = ctx;

  const { shippingAddress: { zip, countryCode, provinceCode } } = input;

  const { calculatedDraftOrder } = await admin.query<
    DraftOrderCalculatePayload,
    MutationDraftOrderCalculateArgs
  >({
    variables: {
      input: {
        lineItems: [...input.lineItems],
        shippingAddress: {
          zip: zip,
          countryCode: countryCode,
          provinceCode: provinceCode ||
            await address.byZipCode(zip).then((address) =>
              address?.provinceCode
            ),
        },
      },
    },
    ...draftOrderCalculate,
  });

  return calculatedDraftOrder;
};

export default action;
