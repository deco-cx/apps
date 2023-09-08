import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
}

export default function ListBlocks(
  _props: Props,
  _req: Request,
  _ctx: AppContext,
) {
  return {
    data: [],
    page: 0,
    pageSize: 0,
    total: 0,
  };
}
