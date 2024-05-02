import { AppContext } from "../mod.ts";

export interface Props {
  key: string;
  sku: string;
  email: string;
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { account } = ctx;
  const { key, sku, email } = props;

  const formdata = new FormData();
  formdata.append("key", key);
  formdata.append("sku", sku);
  formdata.append("email", email);

  const options = {
    method: "POST",
    body: formdata,
  };

  try {
    await fetch(
      `https://${account}.cdn.vnda.com.br/lista_de_espera`,
      options,
    ).then((res) => res.json());
  } catch (error) {
    console.log(error);
  }
};

export default action;
