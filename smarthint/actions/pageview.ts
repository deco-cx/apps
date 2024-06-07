import { AppContext } from "../mod.ts";
import { PageType } from "../utils/typings.ts";

export interface Props {
  shippingPrice: number;
  shippingTime: number;
  pageType: PageType;
  date: string;
  elapsedTime: number;
  productPrice: number;
  session: string;
}

/**
 * @title Smarthint Integration
 * @description Pageview Event
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
    elapsedTime,
    productPrice,
    session,
  } = props;

  const url = new URL(req.url);

  console.log("pageview action");

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
    anonymousConsumer: "1", //TODO
  }).then((r) => r.json());

  return null;
};

export default action;
