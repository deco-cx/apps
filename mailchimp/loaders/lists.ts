import { AppContext } from "../mod.ts";

interface Props {
  count?: number;
  offset?: number;
  fields?: string[];
  exclude_fields?: string[];
}

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { api } = ctx;

  const response = await api["GET /3.0/lists"](props).then(
    (res) => res.json(),
  );

  return response;
}
