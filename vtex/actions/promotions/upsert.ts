import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface PromotionConfiguration {
  /**
   * @description Promotion ID. If provided, updates existing promotion. If not, creates new one.
   */
  idCalculatorConfiguration?: string;
  /**
   * @description Promotion Name
   */
  name: string;
  /**
   * @description Promotion internal description
   */
  description?: string;
  /**
   * @description Promotion Begin Date (UTC) in ISO 8601 format
   * @format date-time
   */
  beginDateUtc: string;
  /**
   * @description Promotion End Date (UTC) in ISO 8601 format
   * @format date-time
   */
  endDateUtc?: string;
  /**
   * @description If set as true, the Promotion is activated
   * @default true
   */
  isActive?: boolean;
  /**
   * @description Defines if a promotion can accumulate with another one
   * @default false
   */
  cumulative?: boolean;
  /**
   * @description The type of discount. Options: "regular", "nominal", "percentage", "nominaldiscount", "percentualdiscount"
   */
  discountType?: string;
  /**
   * @description Percentage discount to be applied
   */
  percentualDiscountValue?: number;
  /**
   * @description Exact discount to be applied
   */
  nominalDiscountValue?: number;
  /**
   * @description Promotion scope configuration
   */
  scope?: {
    categories?: string[];
    brands?: string[];
    skus?: string[];
    collections?: string[];
  };
  /**
   * @description Rates and benefits data specific to the promotion type
   */
  ratesAndBenefitsData?: unknown;
  /**
   * @description Other promotion configuration properties
   */
  [key: string]: unknown;
}

export interface Props {
  /**
   * @description Promotion configuration object
   */
  body: PromotionConfiguration;
}

export const defaultVisibility = "private";

/**
 * @title Create or Update Promotion
 * @description Create a new promotion or update an existing one
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<unknown> => {
  const { vcs } = ctx;
  const { body } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const response = await vcs["POST /api/rnb/pvt/calculatorconfiguration"](
    {},
    {
      body,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        cookie,
      },
    },
  );

  return response.json();
};

export default action;

