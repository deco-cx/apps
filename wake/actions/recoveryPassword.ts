import type { AppContext } from "../mod.ts";
import { CustomerPasswordRecovery } from "../utils/graphql/queries.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { CustomerPasswordRecoveryMutation, CustomerPasswordRecoveryMutationVariables } from "../utils/graphql/storefront.graphql.gen.ts";

export interface Props {
  email: string
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CustomerPasswordRecoveryMutation["customerPasswordRecovery"]> => {
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  const data = await storefront.query<
    CustomerPasswordRecoveryMutation,
    CustomerPasswordRecoveryMutationVariables
  >(
    {
      variables: {
        input: props.email
      },
      ...CustomerPasswordRecovery,
    },
    {
      headers,
    },
  );

  return data.customerPasswordRecovery;
};

export default action;
