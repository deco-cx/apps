import { AppContext } from "../mod.ts";

export interface Props {
  key: string;
  sku: string;
  nome: string;
  url: string;
  referencia: string;
  email: string;
}

const action = async (
    _props: unknown,
    _req: Request,
    ctx: AppContext,
  ):Promise<void> => {
    const { authToken } = ctx
    const stringAuthToken = typeof authToken === "string"
    ? authToken
    : authToken?.get?.() ?? "";

    const options = {
      method: 'POST',
      headers: new Headers({
        "User-Agent": "decocx/1.0",
        "X-Shop-Host": "https://velocita.cdn.vnda.com.br/lista_de_espera",
        "accept": "application/json",
        authorization: `Bearer ${stringAuthToken}`,
      }),
      body: JSON.stringify({
        key: "velocita-avise-me",
        sku: "DD6831-392-P",
        nome: "Shorts Run Nike Swoosh Run Feminino",
        url: "/produto/shorts-run-nike-swoosh-run-feminino-4169",
        referencia: "DD6831-392",
        email: "gustavo.dahm@vnda.com.br",
      })
    };
    const response = await fetch(`https://velocita.cdn.vnda.com.br/lista_de_espera`, options)
  }

  export default action;