import { AppContext } from "../mod.ts";
import { AWSCostExplorerClient, AWSCostUtils } from "../client.ts";
import type { DateInterval, Expression, GroupDefinition } from "../client.ts";

export interface Props {
  /**
   * @title Time Period (Days)
   * @description Number of days to look back for cost data
   * @default 30
   */
  timePeriodDays?: number;

  /**
   * @title Custom Start Date
   * @description Custom start date (YYYY-MM-DD format). If provided, overrides timePeriodDays
   * @format date
   */
  startDate?: string;

  /**
   * @title Custom End Date
   * @description Custom end date (YYYY-MM-DD format). If provided, overrides timePeriodDays
   * @format date
   */
  endDate?: string;

  /**
   * @title Granularity
   * @description The granularity of the cost data
   * @default "DAILY"
   */
  granularity?: "DAILY" | "MONTHLY" | "HOURLY";

  /**
   * @title Group By
   * @description How to group the cost data
   * @default "SERVICE"
   */
  groupBy?:
    | "SERVICE"
    | "AZ"
    | "INSTANCE_TYPE"
    | "LINKED_ACCOUNT"
    | "OPERATION"
    | "PURCHASE_TYPE"
    | "REGION"
    | "USAGE_TYPE"
    | "USAGE_TYPE_GROUP"
    | "RECORD_TYPE"
    | "OPERATING_SYSTEM"
    | "TENANCY"
    | "SCOPE"
    | "PLATFORM";

  /**
   * @title Metrics
   * @description Cost metrics to retrieve
   * @default ["BlendedCost"]
   */
  metrics?: Array<
    | "BlendedCost"
    | "UnblendedCost"
    | "AmortizedCost"
    | "NetUnblendedCost"
    | "NetAmortizedCost"
    | "UsageQuantity"
    | "NormalizedUsageAmount"
  >;

  /**
   * @title Filter by Service
   * @description Filter results by specific AWS service (e.g., "Amazon Elastic Compute Cloud - Compute")
   */
  serviceFilter?: string;

  /**
   * @title Include Forecasted Data
   * @description Whether to include estimated/forecasted data
   * @default true
   */
  includeForecast?: boolean;

  /**
   * @title Max Results
   * @description Maximum number of results to return
   * @default 100
   */
  maxResults?: number;
}

export interface CostData {
  timePeriod: DateInterval;
  total: {
    amount: string;
    unit: string;
    formatted: string;
  };
  groups?: Array<{
    keys: string[];
    metrics: Record<string, {
      amount: string;
      unit: string;
      formatted: string;
    }>;
  }>;
  estimated: boolean;
}

export interface CostAndUsageResponse {
  costData: CostData[];
  summary: {
    totalCost: {
      amount: string;
      unit: string;
      formatted: string;
    };
    timeRange: DateInterval;
    granularity: string;
    groupBy?: string;
    topServices?: Array<{
      service: string;
      cost: number;
      formatted: string;
      percentage: number;
    }>;
  };
  metadata: {
    resultsCount: number;
    hasMoreResults: boolean;
    requestedAt: string;
  };
}

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CostAndUsageResponse> {
  const {
    timePeriodDays = 30,
    startDate,
    endDate,
    granularity = "DAILY",
    groupBy = "SERVICE",
    metrics = ["BlendedCost"],
    serviceFilter,
  } = props;

  // Validate credentials
  if (!ctx.credentials.accessKeyId || !ctx.credentials.secretAccessKey) {
    throw new Error(
      "AWS credentials not configured. Please set accessKeyId and secretAccessKey in the app configuration.",
    );
  }

  const client = new AWSCostExplorerClient(ctx.credentials);

  // Determine time period
  let timePeriod: DateInterval;
  if (startDate && endDate) {
    timePeriod = { Start: startDate, End: endDate };
  } else {
    timePeriod = AWSCostUtils.getDateRange(timePeriodDays);
  }

  // Build group by configuration
  const groupByConfig: GroupDefinition[] = [{
    Type: "DIMENSION",
    Key: groupBy,
  }];

  // Build filter if service is specified
  let filter: Expression | undefined;
  if (serviceFilter) {
    filter = {
      Dimensions: {
        Key: "SERVICE",
        Values: [serviceFilter],
        MatchOptions: ["EQUALS"],
      },
    };
  }

  try {
    const response = await client.getCostAndUsage({
      TimePeriod: timePeriod,
      Granularity: granularity,
      Metrics: metrics,
      GroupBy: groupByConfig,
      Filter: filter,
    });

    // Process the response data
    const costData: CostData[] = response.ResultsByTime.map((result) => {
      const totalMetric = result.Total[metrics[0]];
      let totalAmount = parseFloat(totalMetric?.Amount || "0");

      // If Total is 0 but we have groups (which happens when grouping by dimensions),
      // calculate the total by summing up all the groups
      if (totalAmount === 0 && result.Groups && result.Groups.length > 0) {
        totalAmount = result.Groups.reduce((sum, group) => {
          const groupAmount = parseFloat(
            group.Metrics[metrics[0]]?.Amount || "0",
          );
          return sum + groupAmount;
        }, 0);
      }

      const unit = totalMetric?.Unit || ctx.defaultCurrency || "USD";

      return {
        timePeriod: result.TimePeriod,
        total: {
          amount: totalAmount.toString(),
          unit: unit,
          formatted: AWSCostUtils.formatCurrency(totalAmount.toString(), unit),
        },
        groups: result.Groups?.map((group) => ({
          keys: group.Keys,
          metrics: Object.fromEntries(
            Object.entries(group.Metrics).map(([key, value]) => [
              key,
              {
                amount: value.Amount,
                unit: value.Unit,
                formatted: AWSCostUtils.formatCurrency(
                  value.Amount,
                  value.Unit,
                ),
              },
            ]),
          ),
        })),
        estimated: result.Estimated,
      };
    });

    // Calculate summary data - now using the corrected totals
    const totalCost = costData.reduce((sum, data) => {
      return sum + parseFloat(data.total.amount);
    }, 0);

    const totalCostFormatted = AWSCostUtils.formatCurrency(
      totalCost.toString(),
      costData[0]?.total.unit || ctx.defaultCurrency || "USD",
    );

    // Calculate top services if grouped by service
    let topServices:
      | Array<{
        service: string;
        cost: number;
        formatted: string;
        percentage: number;
      }>
      | undefined;

    if (groupBy === "SERVICE") {
      const serviceMap = AWSCostUtils.groupByService(response);
      const topServicesList = AWSCostUtils.getTopServices(serviceMap, 10);

      topServices = topServicesList.map(({ service, cost }) => ({
        service,
        cost,
        formatted: AWSCostUtils.formatCurrency(cost.toString()),
        percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
      }));
    }

    return {
      costData,
      summary: {
        totalCost: {
          amount: totalCost.toString(),
          unit: costData[0]?.total.unit || ctx.defaultCurrency || "USD",
          formatted: totalCostFormatted,
        },
        timeRange: timePeriod,
        granularity,
        groupBy,
        topServices,
      },
      metadata: {
        resultsCount: costData.length,
        hasMoreResults: !!response.NextPageToken,
        requestedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error fetching cost and usage data:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    throw new Error(`Failed to fetch cost and usage data: ${errorMessage}`);
  }
}
