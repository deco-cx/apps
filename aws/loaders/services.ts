import { AppContext } from "../mod.ts";
import { AWSCostExplorerClient, AWSCostUtils } from "../client.ts";
import type { DateInterval } from "../client.ts";

export interface Props {
  /**
   * @title Time Period (Days)
   * @description Number of days to analyze service costs
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
   * @description The granularity of the analysis
   * @default "MONTHLY"
   */
  granularity?: "DAILY" | "MONTHLY";

  /**
   * @title Top Services Limit
   * @description Number of top services to include in detailed analysis
   * @default 10
   */
  topServicesLimit?: number;

  /**
   * @title Include Cost Trends
   * @description Include cost trend analysis for services
   * @default true
   */
  includeCostTrends?: boolean;

  /**
   * @title Compare with Previous Period
   * @description Compare costs with the previous equivalent period
   * @default true
   */
  compareWithPreviousPeriod?: boolean;

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

export interface ServiceCostData {
  serviceName: string;
  totalCost: {
    amount: string;
    formatted: string;
  };
  percentage: number;
  trend?: {
    direction: "INCREASING" | "DECREASING" | "STABLE";
    changePercentage: number;
    changeAmount: {
      amount: string;
      formatted: string;
    };
  };
  dailyBreakdown?: Array<{
    date: string;
    cost: {
      amount: string;
      formatted: string;
    };
  }>;
  monthlyBreakdown?: Array<{
    month: string;
    cost: {
      amount: string;
      formatted: string;
    };
  }>;
}

export interface ServicesResponse {
  services: ServiceCostData[];
  summary: {
    totalCost: {
      amount: string;
      formatted: string;
    };
    totalServices: number;
    topServicesCost: {
      amount: string;
      formatted: string;
      percentage: number;
    };
    period: DateInterval;
    averageDailyCost: {
      amount: string;
      formatted: string;
    };
  };
  comparison?: {
    previousPeriod: DateInterval;
    totalCostChange: {
      amount: string;
      formatted: string;
      percentage: number;
      direction: "INCREASE" | "DECREASE" | "NO_CHANGE";
    };
    servicesWithBiggestIncrease: Array<{
      serviceName: string;
      increaseAmount: string;
      increasePercentage: number;
    }>;
    servicesWithBiggestDecrease: Array<{
      serviceName: string;
      decreaseAmount: string;
      decreasePercentage: number;
    }>;
  };
  insights: {
    costOptimizationOpportunities: string[];
    riskFactors: string[];
    recommendations: string[];
  };
  metadata: {
    generatedAt: string;
    metric: string;
    granularity: string;
  };
}

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ServicesResponse> {
  const {
    timePeriodDays = 30,
    startDate,
    endDate,
    granularity = "MONTHLY",
    topServicesLimit = 10,
    compareWithPreviousPeriod = true,
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
  let currentPeriod: DateInterval;
  if (startDate && endDate) {
    currentPeriod = { Start: startDate, End: endDate };
  } else {
    currentPeriod = AWSCostUtils.getDateRange(timePeriodDays);
  }

  try {
    // Get current period cost data grouped by service
    const currentResponse = await client.getCostAndUsage({
      TimePeriod: currentPeriod,
      Granularity: granularity,
      Metrics: [metric],
      GroupBy: [{
        Type: "DIMENSION",
        Key: "SERVICE",
      }],
    });

    // Process current period data
    const serviceMap = new Map<string, {
      totalCost: number;
      dailyBreakdown: Array<{ date: string; cost: number }>;
      monthlyBreakdown: Array<{ month: string; cost: number }>;
    }>();

    currentResponse.ResultsByTime.forEach((result) => {
      const period = granularity === "DAILY"
        ? result.TimePeriod.Start
        : result.TimePeriod.Start.substring(0, 7);

      result.Groups?.forEach((group) => {
        const serviceName = group.Keys[0] || "Unknown Service";
        const cost = parseFloat(group.Metrics[metric]?.Amount || "0");

        if (!serviceMap.has(serviceName)) {
          serviceMap.set(serviceName, {
            totalCost: 0,
            dailyBreakdown: [],
            monthlyBreakdown: [],
          });
        }

        const serviceData = serviceMap.get(serviceName)!;
        serviceData.totalCost += cost;

        if (granularity === "DAILY") {
          serviceData.dailyBreakdown.push({
            date: result.TimePeriod.Start,
            cost,
          });
        } else {
          serviceData.monthlyBreakdown.push({
            month: period,
            cost,
          });
        }
      });
    });

    // Calculate total cost
    const totalCost = Array.from(serviceMap.values()).reduce(
      (sum, service) => sum + service.totalCost,
      0,
    );

    // Get previous period data for comparison if requested
    let previousPeriodData: Map<string, number> | undefined;
    let previousPeriod: DateInterval | undefined;

    if (compareWithPreviousPeriod) {
      const currentStart = new Date(currentPeriod.Start);
      const currentEnd = new Date(currentPeriod.End);
      const periodLength = currentEnd.getTime() - currentStart.getTime();

      const previousStart = new Date(currentStart.getTime() - periodLength);
      const previousEnd = new Date(currentStart.getTime());

      previousPeriod = {
        Start: previousStart.toISOString().split("T")[0],
        End: previousEnd.toISOString().split("T")[0],
      };

      try {
        const previousResponse = await client.getCostAndUsage({
          TimePeriod: previousPeriod,
          Granularity: "MONTHLY", // Use monthly for comparison to reduce complexity
          Metrics: [metric],
          GroupBy: [{
            Type: "DIMENSION",
            Key: "SERVICE",
          }],
        });

        previousPeriodData = new Map();
        previousResponse.ResultsByTime.forEach((result) => {
          result.Groups?.forEach((group) => {
            const serviceName = group.Keys[0] || "Unknown Service";
            const cost = parseFloat(group.Metrics[metric]?.Amount || "0");

            const existingCost = previousPeriodData!.get(serviceName) || 0;
            previousPeriodData!.set(serviceName, existingCost + cost);
          });
        });
      } catch (error) {
        console.warn(
          "Could not fetch previous period data for comparison:",
          error,
        );
      }
    }

    // Sort services by cost and take top N
    const sortedServices = Array.from(serviceMap.entries())
      .sort(([, a], [, b]) => b.totalCost - a.totalCost)
      .slice(0, topServicesLimit);

    // Process service data
    const services: ServiceCostData[] = sortedServices.map(
      ([serviceName, serviceData]) => {
        const percentage = totalCost > 0
          ? (serviceData.totalCost / totalCost) * 100
          : 0;

        // Calculate trend if previous period data is available
        let trend: ServiceCostData["trend"];
        if (previousPeriodData?.has(serviceName)) {
          const previousCost = previousPeriodData.get(serviceName)!;
          const changeAmount = serviceData.totalCost - previousCost;
          const changePercentage = previousCost > 0
            ? (changeAmount / previousCost) * 100
            : 0;

          let direction: "INCREASING" | "DECREASING" | "STABLE";
          if (Math.abs(changePercentage) < 5) {
            direction = "STABLE";
          } else {
            direction = changeAmount > 0 ? "INCREASING" : "DECREASING";
          }

          trend = {
            direction,
            changePercentage: Math.abs(changePercentage),
            changeAmount: {
              amount: Math.abs(changeAmount).toString(),
              formatted: AWSCostUtils.formatCurrency(
                Math.abs(changeAmount).toString(),
              ),
            },
          };
        }

        return {
          serviceName,
          totalCost: {
            amount: serviceData.totalCost.toString(),
            formatted: AWSCostUtils.formatCurrency(
              serviceData.totalCost.toString(),
            ),
          },
          percentage,
          trend,
          dailyBreakdown: granularity === "DAILY"
            ? serviceData.dailyBreakdown.map((item) => ({
              date: item.date,
              cost: {
                amount: item.cost.toString(),
                formatted: AWSCostUtils.formatCurrency(item.cost.toString()),
              },
            }))
            : undefined,
          monthlyBreakdown: granularity === "MONTHLY"
            ? serviceData.monthlyBreakdown.map((item) => ({
              month: item.month,
              cost: {
                amount: item.cost.toString(),
                formatted: AWSCostUtils.formatCurrency(item.cost.toString()),
              },
            }))
            : undefined,
        };
      },
    );

    // Calculate summary
    const topServicesCost = services.reduce(
      (sum, service) => sum + parseFloat(service.totalCost.amount),
      0,
    );
    const periodDays = Math.ceil(
      (new Date(currentPeriod.End).getTime() -
        new Date(currentPeriod.Start).getTime()) / (1000 * 60 * 60 * 24),
    );
    const averageDailyCost = totalCost / Math.max(1, periodDays);

    // Generate comparison data
    let comparison: ServicesResponse["comparison"];
    if (previousPeriodData && previousPeriod) {
      const previousTotal = Array.from(previousPeriodData.values()).reduce(
        (sum, cost) => sum + cost,
        0,
      );
      const totalCostChange = totalCost - previousTotal;
      const totalCostChangePercentage = previousTotal > 0
        ? (totalCostChange / previousTotal) * 100
        : 0;

      let direction: "INCREASE" | "DECREASE" | "NO_CHANGE";
      if (Math.abs(totalCostChangePercentage) < 1) {
        direction = "NO_CHANGE";
      } else {
        direction = totalCostChange > 0 ? "INCREASE" : "DECREASE";
      }

      // Find services with biggest changes
      const serviceChanges: Array<
        { serviceName: string; change: number; percentage: number }
      > = [];

      services.forEach((service) => {
        if (service.trend) {
          const changeAmount = service.trend.direction === "INCREASING"
            ? parseFloat(service.trend.changeAmount.amount)
            : -parseFloat(service.trend.changeAmount.amount);

          serviceChanges.push({
            serviceName: service.serviceName,
            change: changeAmount,
            percentage: service.trend.direction === "INCREASING"
              ? service.trend.changePercentage
              : -service.trend.changePercentage,
          });
        }
      });

      const servicesWithBiggestIncrease = serviceChanges
        .filter((s) => s.change > 0)
        .sort((a, b) => b.change - a.change)
        .slice(0, 3)
        .map((s) => ({
          serviceName: s.serviceName,
          increaseAmount: AWSCostUtils.formatCurrency(s.change.toString()),
          increasePercentage: s.percentage,
        }));

      const servicesWithBiggestDecrease = serviceChanges
        .filter((s) => s.change < 0)
        .sort((a, b) => a.change - b.change)
        .slice(0, 3)
        .map((s) => ({
          serviceName: s.serviceName,
          decreaseAmount: AWSCostUtils.formatCurrency(
            Math.abs(s.change).toString(),
          ),
          decreasePercentage: Math.abs(s.percentage),
        }));

      comparison = {
        previousPeriod,
        totalCostChange: {
          amount: Math.abs(totalCostChange).toString(),
          formatted: AWSCostUtils.formatCurrency(
            Math.abs(totalCostChange).toString(),
          ),
          percentage: Math.abs(totalCostChangePercentage),
          direction,
        },
        servicesWithBiggestIncrease,
        servicesWithBiggestDecrease,
      };
    }

    // Generate insights
    const insights = {
      costOptimizationOpportunities: [] as string[],
      riskFactors: [] as string[],
      recommendations: [] as string[],
    };

    // Analyze top services for optimization opportunities
    const topService = services[0];
    if (topService && topService.percentage > 50) {
      insights.riskFactors.push(
        `${topService.serviceName} accounts for ${
          topService.percentage.toFixed(1)
        }% of total costs - high concentration risk`,
      );
      insights.costOptimizationOpportunities.push(
        `Focus on optimizing ${topService.serviceName} as it represents the largest cost component`,
      );
    }

    // Check for services with high growth
    services.forEach((service) => {
      if (
        service.trend?.direction === "INCREASING" &&
        service.trend.changePercentage > 50
      ) {
        insights.riskFactors.push(
          `${service.serviceName} costs increased by ${
            service.trend.changePercentage.toFixed(1)
          }%`,
        );
        insights.recommendations.push(
          `Investigate unusual cost increase in ${service.serviceName}`,
        );
      }
    });

    // General recommendations
    if (services.length >= 5) {
      insights.recommendations.push(
        "Consider consolidating workloads to reduce service sprawl and management overhead",
      );
    }

    if (totalCost > 1000) {
      insights.costOptimizationOpportunities.push(
        "Consider purchasing reserved instances or savings plans for predictable workloads",
      );
    }

    insights.recommendations.push(
      "Regularly review and rightsize resources based on utilization metrics",
    );
    insights.recommendations.push(
      "Implement automated cost alerts to monitor spending trends",
    );

    return {
      services,
      summary: {
        totalCost: {
          amount: totalCost.toString(),
          formatted: AWSCostUtils.formatCurrency(totalCost.toString()),
        },
        totalServices: serviceMap.size,
        topServicesCost: {
          amount: topServicesCost.toString(),
          formatted: AWSCostUtils.formatCurrency(topServicesCost.toString()),
          percentage: totalCost > 0 ? (topServicesCost / totalCost) * 100 : 0,
        },
        period: currentPeriod,
        averageDailyCost: {
          amount: averageDailyCost.toString(),
          formatted: AWSCostUtils.formatCurrency(averageDailyCost.toString()),
        },
      },
      comparison,
      insights,
      metadata: {
        generatedAt: new Date().toISOString(),
        metric,
        granularity,
      },
    };
  } catch (error) {
    console.error("Error fetching service cost data:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    throw new Error(`Failed to fetch service cost data: ${errorMessage}`);
  }
}
