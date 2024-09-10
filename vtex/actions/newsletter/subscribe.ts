import { AppContext } from "../../mod.ts";

export interface Props {
  email: string;
  name?: string;
  page?: string;
  part?: string;
  campaing?: string;
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { vcsDeprecated } = ctx;
  const form = new FormData();
  const {
    email,
    name = "",
    part = "newsletter",
    page = "_",
    campaing = "newsletter:opt-in",
  } = props;

  form.append("newsletterClientName", name);
  form.append("newsletterClientEmail", email);
  form.append("newsInternalPage", page);
  form.append("newsInternalPart", part);
  form.append("newsInternalCampaign", campaing);

  await vcsDeprecated["POST /no-cache/Newsletter.aspx"]({}, {
    body: form,
  });
};

export default action;
