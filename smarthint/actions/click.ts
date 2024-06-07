import { AppContext } from "../mod.ts";
import { getUserHash } from "../utils/parseHeaders.ts";
import { PageType } from "../utils/typings.ts";

export interface Props {
  shippingPrice?: number;
  shippingTime?: number;
  pageType: PageType;
  date?: string;
  elapsedTime?: number;
  productPrice: number;
  session?: string;
  clickFeature: string;
  term: string;
  position: number;
  productId: string;
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
    productId,
    positionRecommendation,
    clickProduct,
  } = props;

  const url = new URL(req.url);

  const anonymous = getUserHash(req.headers);

  await recs["GET /track/click"]({
    date,
    origin: url.origin,
    shcode,
    session,
    pageType,
    term,
    position: String(position),
    productId,
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
