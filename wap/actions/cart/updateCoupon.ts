import { AppContext } from "../../mod.ts";

export interface Status {
  sucesso: boolean;
}

export interface Props {
  hashCupom: string;
}

/**
 * @title Wap Integration
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Status> => {
  const { api } = ctx;
  const { hashCupom } = props;

  const response = await api
    ["PUT /api/v2/front/promotional/coupon/:hashCupom"]({
      hashCupom,
    }, {
      headers: req.headers,
    });

  return response.json() as Promise<Status>;
};

export default loader;
