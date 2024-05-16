import { AppContext } from "../../mod.ts";
import { CreateEmailOptions, CreateEmailResponse } from "../../utils/types.ts";

export type Props = CreateEmailOptions;

const action = async (
  payload: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CreateEmailResponse> => {
  const { apiWrite, emailFrom, emailTo, subject } = ctx;
  const emailFromDefault = `${emailFrom?.name ?? "Contact"} ${
    emailFrom?.domain ?? "<onboarding@resend.dev>"
  }`;

  const response = await apiWrite["POST /emails"]({}, {
    body: {
      ...payload,
      from: payload?.from ?? emailFromDefault,
      to: payload?.to ?? emailTo,
      subject: payload?.subject ?? subject,
    },
  });

  const data = await response.json();

  return data as CreateEmailResponse;
};

export default action;
