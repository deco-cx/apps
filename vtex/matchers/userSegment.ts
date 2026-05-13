import { type MatchContext } from "@deco/deco/blocks";
import { parseAuthCookie } from "../utils/vtexId.ts";

/** @title Anonymous without cart */
interface AnonymousWithoutCart {
  /**
   * @hide true
   */
  segment: "anonymous-without-cart";
}

/** @title Anonymous with cart */
interface AnonymousWithCart {
  /**
   * @hide true
   */
  segment: "anonymous-with-cart";
}

/** @title Logged in */
interface LoggedIn {
  /**
   * @hide true
   */
  segment: "logged-in";
}

/** @title Logged in without orders */
interface LoggedInWithoutOrders {
  /**
   * @hide true
   */
  segment: "logged-in-without-orders";
}

/** @title Logged in with orders */
interface LoggedInWithOrders {
  /**
   * @hide true
   */
  segment: "logged-in-with-orders";
}

/** @title Logged in with recent orders */
interface LoggedInWithRecentOrders {
  /**
   * @hide true
   */
  segment: "logged-in-with-recent-orders";
  /**
   * @title Months
   * @description Number of months to consider an order as "recent"
   * @default 3
   */
  months?: number;
}

export type Props =
  | AnonymousWithoutCart
  | AnonymousWithCart
  | LoggedIn
  | LoggedInWithoutOrders
  | LoggedInWithOrders
  | LoggedInWithRecentOrders;

/**
 * @title User Segment
 * @description Segment users by authentication status, cart state, and order history
 * @icon user-check
 */
const MatchUserSegment = async (
  props: Props,
  { request, invoke }: MatchContext,
): Promise<boolean> => {
  const { segment } = props;
  // deno-lint-ignore no-explicit-any
  const vtex = (invoke as any).vtex;

  const payload = parseAuthCookie(request.headers);
  const isLoggedIn = Boolean(payload?.sub && payload?.userId);

  try {
    if (segment === "anonymous-without-cart") {
      if (isLoggedIn) return false;
      const cart = await vtex.loaders.cart();
      return (cart?.items?.length ?? 0) === 0;
    }

    if (segment === "anonymous-with-cart") {
      if (isLoggedIn) return false;
      const cart = await vtex.loaders.cart();
      return (cart?.items?.length ?? 0) > 0;
    }

    // All remaining segments require login
    if (!isLoggedIn || !payload?.sub) return false;

    if (segment === "logged-in") {
      return true;
    }

    const email = payload.sub;

    if (segment === "logged-in-without-orders") {
      const orders = await vtex.loaders.orders.list({
        clientEmail: email,
        per_page: "1",
        page: "1",
      });
      return orders?.paging?.total === 0;
    }

    if (segment === "logged-in-with-orders") {
      const orders = await vtex.loaders.orders.list({
        clientEmail: email,
        per_page: "1",
        page: "1",
      });
      return orders?.paging?.total > 0;
    }

    if (segment === "logged-in-with-recent-orders") {
      const { months = 3 } = props;
      const orders = await vtex.loaders.orders.list({
        clientEmail: email,
        per_page: "15",
        page: "1",
      });

      if (!orders?.paging?.total) return false;

      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - months);

      return orders.list.some((order: { creationDate: string }) => {
        const created = new Date(order.creationDate);
        return created >= cutoff;
      });
    }

    return false;
  } catch {
    return false;
  }
};

export default MatchUserSegment;
