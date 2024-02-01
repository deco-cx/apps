import { allowCorsFor } from "deco/mod.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  path: string;
}

const loader = (props: Props, req: Request, ctx: AppContext): string[] => {
  Object.entries(allowCorsFor(req)).map(([name, value]) => {
    ctx.response.headers.set(name, value);
  });

  const params: string[] = [];

  props.path.split("/").forEach((param) => {
    if (param.startsWith(":")) {
      params.push(param.substring(1));
    }
  });

  return params;
};

export default loader;
