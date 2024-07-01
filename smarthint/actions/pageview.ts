import { AppContext } from "../mod.ts";
import { getSessionCookie } from "../utils/getSession.ts";
import { PageType } from "../utils/typings.ts";

export interface Props {
  shippingPrice: number;
  shippingTime: number;
  /**
   * @description Type of page you are setting up.
   */
  pageType: PageType;
  date: string;
  elapsedTime: number;
  productPrice: number;
}

/**
 * @title SmartHint Integration
 * @description Pageview Event
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { recs, shcode } = ctx;
  const {
    shippingPrice,
    shippingTime,
    pageType,
    date,
    elapsedTime,
    productPrice,
  } = props;

  const url = new URL(req.url);
  const { anonymous, session } = getSessionCookie(req.headers);

  await recs["GET /track/pageView"]({
    url: req.url,
    date,
    origin: url.origin,
    shcode,
    session,
    pageType,
    elapsedTime: String(elapsedTime),
    productPrice: String(productPrice),
    shippingTime: String(shippingTime),
    shippingPrice: String(shippingPrice),
    anonymousConsumer: anonymous,
  });
};

export default action;
