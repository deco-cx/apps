import { AppContext } from "../mod.ts";
import { getSessionCookie } from "../utils/getSession.ts";
import { PageType } from "../utils/typings.ts";

export interface Props {
  shippingPrice?: number;
  shippingTime?: number;
  /**
   * @description Type of page you are setting up.
   */
  pageType: PageType;
  date?: string;
  elapsedTime?: number;
  productPrice: number;
  session?: string;
  clickFeature: string;
  term: string;
  position: number;
  productGroupID: string;
  clickProduct: string;
  positionRecommendation: string;
}

/**
 * @title Smarthint Integration
 * @description Pageview Click Event
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<null> => {
  const { recs, shcode } = ctx;
  const {
    shippingPrice,
    shippingTime,
    pageType,
    date,
    productPrice,
    session,
    clickFeature,
    term,
    position,
    productGroupID,
    positionRecommendation,
    clickProduct,
  } = props;

  const url = new URL(req.url);
  const anonymous = getSessionCookie(req.headers);

  await recs["GET /track/click"]({
    date,
    origin: url.origin,
    shcode,
    session,
    pageType,
    term,
    position: String(position),
    productId: productGroupID,
    productPrice: String(productPrice),
    shippingTime: String(shippingTime),
    shippingPrice: String(shippingPrice),
    anonymousConsumer: anonymous,
    clickProduct,
    clickFeature,
    locationRecs: positionRecommendation,
  }).then((r) => r.json());

  return null;
};

export default action;
