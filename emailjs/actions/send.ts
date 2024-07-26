import { AppContext } from "../mod.ts";
import type { CreateEmailResponse } from "../utils/types.ts";

export interface Props {
  /**
   * @description Template ID of the email
   */
  template_id: string;
  /**
   * @description Template parameters of the template
   */
  template_params?: Array<{ key: string; value: string }>;
}

const action = async (
  payload: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CreateEmailResponse> => {
  const { api, service_id, user_id, accessToken } = ctx;

  const stringAccessToken = typeof accessToken === "string"
    ? accessToken
    : accessToken?.get?.() ?? "";

  const templateParamsObject = payload.template_params?.reduce(
    (acc, { key, value }) => {
      acc[key] = value;
      return acc;
    },
    {} as { [key: string]: string },
  );

  const response = await api["POST /email/send"]({}, {
    body: {
      ...payload,
      template_params: templateParamsObject,
      service_id,
      user_id,
      accessToken: stringAccessToken,
    },
  });

  const data = await response.json();

  return data as CreateEmailResponse;
};

export default action;
