import { AppContext } from "../mod.ts";
import { AWSCostExplorerClient, AWSCostUtils } from "../client.ts";
import type { DateInterval, GroupDefinition } from "../client.ts";

export interface Props {
  /**
   * @title Time Period (Days)
   * @description Number of days to analyze for cost breakdown
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
   * @title Primary Dimension
   * @description Primary dimension for cost breakdown
   * @default "SERVICE"
   */
  primaryDimension?:
    | "SERVICE"
    | "AZ"
    | "INSTANCE_TYPE"
    | "LINKED_ACCOUNT"
    | "OPERATION"
    | "PURCHASE_TYPE"
    | "REGION"
    | "USAGE_TYPE"
    | "USAGE_TYPE_GROUP";

  /**
   * @title Secondary Dimension
   * @description Secondary dimension for detailed breakdown (optional)
   */
  secondaryDimension?:
    | "SERVICE"
    | "AZ"
    | "INSTANCE_TYPE"
    | "LINKED_ACCOUNT"
    | "OPERATION"
    | "PURCHASE_TYPE"
    | "REGION"
    | "USAGE_TYPE"
    | "USAGE_TYPE_GROUP";

  /**
   * @title Include Regional Breakdown
   * @description Include detailed breakdown by AWS regions
   * @default true
   */
  includeRegionalBreakdown?: boolean;

  /**
   * @title Include Account Breakdown
   * @description Include breakdown by linked accounts (for consolidated billing)
   * @default false
   */
  includeAccountBreakdown?: boolean;

  /**
   * @title Include Usage Type Analysis
   * @description Include detailed usage type analysis
   * @default true
   */
  includeUsageTypeAnalysis?: boolean;

  /**
   * @title Top Items Limit
   * @description Number of top items to show for each dimension
   * @default 10
   */
  topItemsLimit?: number;

  /**
   * @title Metric
   * @description Cost metric to analyze
   * @default "BlendedCost"
   */
  metric?:
    | "BlendedCost"
    | "UnblendedCost"
    | "AmortizedCost"
    | "NetUnblendedCost"
    | "NetAmortizedCost";
}

export interface BreakdownItem {
  name: string;
  cost: {
    amount: string;
    formatted: string;
  };
  percentage: number;
  subBreakdown?: BreakdownItem[];
}

export interface DimensionBreakdown {
  dimension: string;
  items: BreakdownItem[];
  totalCost: {
    amount: string;
    formatted: string;
  };
  topItem: {
    name: string;
    cost: string;
    percentage: number;
  };
}

export interface CostBreakdownResponse {
  primaryBreakdown: DimensionBreakdown;
  secondaryBreakdown?: DimensionBreakdown;
  regionalBreakdown?: DimensionBreakdown;
  accountBreakdown?: DimensionBreakdown;
  usageTypeBreakdown?: DimensionBreakdown;
  summary: {
    totalCost: {
      amount: string;
      formatted: string;
    };
    period: DateInterval;
    primaryDimension: string;
    itemsAnalyzed: number;
    costDistribution: {
      top3ItemsPercentage: number;
      top5ItemsPercentage: number;
      top10ItemsPercentage: number;
    };
  };
  insights: {
    costConcentration: {
      level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      description: string;
    };
    regionalDistribution: {
      primaryRegion: string;
      regionCount: number;
      isWellDistributed: boolean;
    };
    recommendations: string[];
    riskFactors: string[];
  };
  metadata: {
    generatedAt: string;
    metric: string;
    dimensions: string[];
  };
}

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CostBreakdownResponse> {
  const {
    timePeriodDays = 30,
    startDate,
    endDate,
    primaryDimension = "SERVICE",
    secondaryDimension,
    includeRegionalBreakdown = true,
    includeAccountBreakdown = false,
    includeUsageTypeAnalysis = true,
    topItemsLimit = 10,
    metric = "BlendedCost",
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

  try {
    // Helper function to get breakdown for a dimension
    const getBreakdownForDimension = async (
      dimension: string,
    ): Promise<DimensionBreakdown> => {
      const groupBy: GroupDefinition[] = [{
        Type: "DIMENSION",
        Key: dimension,
      }];

      const response = await client.getCostAndUsage({
        TimePeriod: timePeriod,
        Granularity: "MONTHLY",
        Metrics: [metric],
        GroupBy: groupBy,
      });

      // Aggregate data across time periods
      const itemMap = new Map<string, number>();

      response.ResultsByTime.forEach((result) => {
        result.Groups?.forEach((group) => {
          const itemName = group.Keys[0] || "Unknown";
          const cost = parseFloat(group.Metrics[metric]?.Amount || "0");
          const existingCost = itemMap.get(itemName) || 0;
          itemMap.set(itemName, existingCost + cost);
        });
      });

      // Sort by cost and take top items
      const sortedItems = Array.from(itemMap.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, topItemsLimit);

      const totalCost = Array.from(itemMap.values()).reduce(
        (sum, cost) => sum + cost,
        0,
      );

      const items: BreakdownItem[] = sortedItems.map(([name, cost]) => ({
        name,
        cost: {
          amount: cost.toString(),
          formatted: AWSCostUtils.formatCurrency(cost.toString()),
        },
        percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
      }));

      const topItem = items[0];

      return {
        dimension,
        items,
        totalCost: {
          amount: totalCost.toString(),
          formatted: AWSCostUtils.formatCurrency(totalCost.toString()),
        },
        topItem: {
          name: topItem?.name || "N/A",
          cost: topItem?.cost.formatted || "$0.00",
          percentage: topItem?.percentage || 0,
        },
      };
    };

    // Get primary breakdown
    const primaryBreakdown = await getBreakdownForDimension(primaryDimension);

    // Get secondary breakdown if specified
    let secondaryBreakdown: DimensionBreakdown | undefined;
    if (secondaryDimension && secondaryDimension !== primaryDimension) {
      secondaryBreakdown = await getBreakdownForDimension(secondaryDimension);
    }

    // Get regional breakdown if requested
    let regionalBreakdown: DimensionBreakdown | undefined;
    if (includeRegionalBreakdown && primaryDimension !== "REGION") {
      regionalBreakdown = await getBreakdownForDimension("REGION");
    }

    // Get account breakdown if requested
    let accountBreakdown: DimensionBreakdown | undefined;
    if (includeAccountBreakdown && primaryDimension !== "LINKED_ACCOUNT") {
      try {
        accountBreakdown = await getBreakdownForDimension("LINKED_ACCOUNT");
      } catch (error) {
        console.warn("Could not fetch account breakdown:", error);
      }
    }

    // Get usage type breakdown if requested
    let usageTypeBreakdown: DimensionBreakdown | undefined;
    if (includeUsageTypeAnalysis && primaryDimension !== "USAGE_TYPE") {
      usageTypeBreakdown = await getBreakdownForDimension("USAGE_TYPE");
    }

    // Calculate summary statistics
    const totalCost = parseFloat(primaryBreakdown.totalCost.amount);
    const top3Cost = primaryBreakdown.items.slice(0, 3).reduce(
      (sum, item) => sum + parseFloat(item.cost.amount),
      0,
    );
    const top5Cost = primaryBreakdown.items.slice(0, 5).reduce(
      (sum, item) => sum + parseFloat(item.cost.amount),
      0,
    );
    const top10Cost = primaryBreakdown.items.slice(0, 10).reduce(
      (sum, item) => sum + parseFloat(item.cost.amount),
      0,
    );

    const costDistribution = {
      top3ItemsPercentage: totalCost > 0 ? (top3Cost / totalCost) * 100 : 0,
      top5ItemsPercentage: totalCost > 0 ? (top5Cost / totalCost) * 100 : 0,
      top10ItemsPercentage: totalCost > 0 ? (top10Cost / totalCost) * 100 : 0,
    };

    // Analyze cost concentration
    let costConcentrationLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    let costConcentrationDescription: string;

    if (costDistribution.top3ItemsPercentage > 80) {
      costConcentrationLevel = "CRITICAL";
      costConcentrationDescription =
        "Extremely high cost concentration - top 3 items account for over 80% of costs";
    } else if (costDistribution.top3ItemsPercentage > 60) {
      costConcentrationLevel = "HIGH";
      costConcentrationDescription =
        "High cost concentration - top 3 items account for over 60% of costs";
    } else if (costDistribution.top5ItemsPercentage > 70) {
      costConcentrationLevel = "MEDIUM";
      costConcentrationDescription =
        "Moderate cost concentration - top 5 items account for over 70% of costs";
    } else {
      costConcentrationLevel = "LOW";
      costConcentrationDescription =
        "Well-distributed costs across multiple items";
    }

    // Analyze regional distribution
    const regionalData = regionalBreakdown || primaryBreakdown;
    const primaryRegion = regionalData.topItem.name;
    const regionCount = regionalData.items.length;
    const isWellDistributed = regionalData.topItem.percentage < 60;

    // Generate insights and recommendations
    const recommendations: string[] = [];
    const riskFactors: string[] = [];

    if (
      costConcentrationLevel === "CRITICAL" || costConcentrationLevel === "HIGH"
    ) {
      riskFactors.push(
        `High cost concentration in ${primaryDimension.toLowerCase()}`,
      );
      recommendations.push(
        `Diversify your usage across different ${primaryDimension.toLowerCase()}s to reduce risk`,
      );
    }

    if (primaryBreakdown.topItem.percentage > 70) {
      riskFactors.push(
        `${primaryBreakdown.topItem.name} represents ${
          primaryBreakdown.topItem.percentage.toFixed(1)
        }% of total costs`,
      );
      recommendations.push(
        `Focus optimization efforts on ${primaryBreakdown.topItem.name}`,
      );
    }

    if (!isWellDistributed && regionalBreakdown) {
      riskFactors.push(
        `Regional concentration risk - ${primaryRegion} accounts for ${
          regionalBreakdown.topItem.percentage.toFixed(1)
        }% of costs`,
      );
      recommendations.push(
        "Consider distributing workloads across multiple regions for better resilience",
      );
    }

    if (regionCount === 1) {
      riskFactors.push("Single region deployment - no geographic redundancy");
      recommendations.push(
        "Consider multi-region deployment for disaster recovery and cost optimization",
      );
    }

    // General recommendations based on cost patterns
    if (totalCost > 10000) {
      recommendations.push(
        "Consider enterprise savings plans or reserved instances for significant cost savings",
      );
    }

    if (primaryDimension === "SERVICE" && primaryBreakdown.items.length > 10) {
      recommendations.push(
        "Consider consolidating services to reduce management overhead",
      );
    }

    recommendations.push(
      "Regularly review cost allocation tags for better cost tracking",
    );
    recommendations.push(
      "Set up automated cost alerts for unusual spending patterns",
    );

    const analyzedDimensions = [primaryDimension];
    if (secondaryDimension) analyzedDimensions.push(secondaryDimension);
    if (includeRegionalBreakdown && primaryDimension !== "REGION") {
      analyzedDimensions.push("REGION");
    }
    if (includeAccountBreakdown && primaryDimension !== "LINKED_ACCOUNT") {
      analyzedDimensions.push("LINKED_ACCOUNT");
    }
    if (includeUsageTypeAnalysis && primaryDimension !== "USAGE_TYPE") {
      analyzedDimensions.push("USAGE_TYPE");
    }

    return {
      primaryBreakdown,
      secondaryBreakdown,
      regionalBreakdown,
      accountBreakdown,
      usageTypeBreakdown,
      summary: {
        totalCost: {
          amount: totalCost.toString(),
          formatted: AWSCostUtils.formatCurrency(totalCost.toString()),
        },
        period: timePeriod,
        primaryDimension,
        itemsAnalyzed: primaryBreakdown.items.length,
        costDistribution,
      },
      insights: {
        costConcentration: {
          level: costConcentrationLevel,
          description: costConcentrationDescription,
        },
        regionalDistribution: {
          primaryRegion,
          regionCount,
          isWellDistributed,
        },
        recommendations,
        riskFactors,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        metric,
        dimensions: analyzedDimensions,
      },
    };
  } catch (error) {
    console.error("Error fetching cost breakdown data:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    throw new Error(`Failed to fetch cost breakdown data: ${errorMessage}`);
  }
}
