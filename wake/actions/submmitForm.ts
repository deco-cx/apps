import { AppContext } from "../mod.ts";
import { SendGenericForm } from "../utils/graphql/queries.ts";
import {
  SendGenericFormMutation,
  SendGenericFormMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

export interface Props {
  body: unknown;
  // file: Upload,
  recaptchaToken: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<SendGenericFormMutation["sendGenericForm"]> => {
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  const data = await storefront.query<
    SendGenericFormMutation,
    SendGenericFormMutationVariables
  >({
    variables: props,
    ...SendGenericForm,
  }, {
    headers,
  });

  return data.sendGenericForm!;
};

export default action;
