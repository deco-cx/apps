import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  /**
   * @description Page number for pagination
   * @default 1
   */
  page?: number;
  /**
   * @description Number of orders per page
   * @default 15
   */
  per_page?: number;
  /**
   * @description Order by field. Options: "creationDate", "orderId", "totalValue"
   * @default "creationDate,desc"
   */
  orderBy?: string;
  /**
   * @description Search query to filter orders
   */
  q?: string;
  /**
   * @description Filter by creation date range (e.g., "creationDate:[2024-01-01T00:00:00.000Z TO 2024-12-31T23:59:59.999Z]")
   */
  f_creationDate?: string;
  /**
   * @description Filter by order status (e.g., "ready-for-handling", "invoiced", "payment-approved")
   */
  f_status?: string;
  /**
   * @description Filter by sales channel
   */
  f_salesChannel?: string;
  /**
   * @description Filter by shipping method
   */
  f_shippingEstimate?: string;
  /**
   * @description Filter by UTM source
   */
  f_UtmSource?: string;
  /**
   * @description Filter by UTM campaign
   */
  f_UtmCampaign?: string;
  /**
   * @description Filter by seller
   */
  f_sellerNames?: string;
  /**
   * @description Filter by affiliate ID
   */
  f_affiliateId?: string;
}

export const defaultVisibility = "private";

/**
 * @title List Orders by Range with Filters
 * @description Get a list of orders with filters for date range, status, and other criteria
 */
export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<unknown> {
  const { vcs } = ctx;
  const {
    page = 1,
    per_page = 15,
    orderBy = "creationDate,desc",
    q,
    f_creationDate,
    f_status,
    f_salesChannel,
    f_shippingEstimate,
    f_UtmSource,
    f_UtmCampaign,
    f_sellerNames,
    f_affiliateId,
  } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  // Build query parameters
  const searchParams: Record<string, string> = {
    page: page.toString(),
    per_page: per_page.toString(),
    orderBy,
  };

  if (q) searchParams.q = q;
  if (f_creationDate) searchParams.f_creationDate = f_creationDate;
  if (f_status) searchParams.f_status = f_status;
  if (f_salesChannel) searchParams.f_salesChannel = f_salesChannel;
  if (f_shippingEstimate) searchParams.f_shippingEstimate = f_shippingEstimate;
  if (f_UtmSource) searchParams.f_UtmSource = f_UtmSource;
  if (f_UtmCampaign) searchParams.f_UtmCampaign = f_UtmCampaign;
  if (f_sellerNames) searchParams.f_sellerNames = f_sellerNames;
  if (f_affiliateId) searchParams.f_affiliateId = f_affiliateId;

  const ordersResponse = await vcs["GET /api/oms/pvt/orders"](
    searchParams,
    {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        cookie,
      },
    },
  );

  const ordersList = await ordersResponse.json();

  return ordersList;
}

