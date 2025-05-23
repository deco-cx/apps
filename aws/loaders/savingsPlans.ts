import { AppContext } from "../mod.ts";
import { AWSCostExplorerClient, AWSCostUtils } from "../client.ts";
import type { DateInterval } from "../client.ts";

export interface Props {
  /**
   * @title Time Period (Days)
   * @description Number of days to analyze savings plans utilization
   * @default 30
   */
  timePeriodDays?: number;

  /**
   * @title Custom Start Date
   * @description Custom start date (YYYY-MM-DD format)
   * @format date
   */
  startDate?: string;

  /**
   * @title Custom End Date
   * @description Custom end date (YYYY-MM-DD format)
   * @format date
   */
  endDate?: string;

  /**
   * @title Granularity
   * @description The granularity of the utilization data
   * @default "MONTHLY"
   */
  granularity?: "DAILY" | "MONTHLY";
}

export interface SavingsPlansResponse {
  utilizationData: Array<{
    timePeriod: DateInterval;
    utilizationPercentage: number;
    totalCommitment: {
      amount: string;
      formatted: string;
    };
    usedCommitment: {
      amount: string;
      formatted: string;
    };
    unusedCommitment: {
      amount: string;
      formatted: string;
    };
    netSavings: {
      amount: string;
      formatted: string;
    };
  }>;
  summary: {
    averageUtilization: number;
    totalCommitment: {
      amount: string;
      formatted: string;
    };
    totalSavings: {
      amount: string;
      formatted: string;
    };
    period: DateInterval;
  };
  metadata: {
    generatedAt: string;
    granularity: string;
  };
}

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SavingsPlansResponse> {
  const {
    timePeriodDays = 30,
    startDate,
    endDate,
    granularity = "MONTHLY",
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
    const response = await client.getSavingsPlansUtilization({
      TimePeriod: timePeriod,
      Granularity: granularity,
    });

    const utilizationData = response.SavingsPlansUtilizationsByTime.map(
      (utilization) => ({
        timePeriod: utilization.TimePeriod,
        utilizationPercentage: parseFloat(
          utilization.Utilization.UtilizationPercentage,
        ),
        totalCommitment: {
          amount: utilization.Utilization.TotalCommitment,
          formatted: AWSCostUtils.formatCurrency(
            utilization.Utilization.TotalCommitment,
          ),
        },
        usedCommitment: {
          amount: utilization.Utilization.UsedCommitment,
          formatted: AWSCostUtils.formatCurrency(
            utilization.Utilization.UsedCommitment,
          ),
        },
        unusedCommitment: {
          amount: utilization.Utilization.UnusedCommitment,
          formatted: AWSCostUtils.formatCurrency(
            utilization.Utilization.UnusedCommitment,
          ),
        },
        netSavings: {
          amount: utilization.Savings.NetSavings,
          formatted: AWSCostUtils.formatCurrency(
            utilization.Savings.NetSavings,
          ),
        },
      }),
    );

    const averageUtilization = utilizationData.length > 0
      ? utilizationData.reduce(
        (sum, data) => sum + data.utilizationPercentage,
        0,
      ) / utilizationData.length
      : 0;

    const totalCommitment = parseFloat(
      response.Total.Utilization.TotalCommitment,
    );
    const totalSavings = parseFloat(response.Total.Savings.NetSavings);

    return {
      utilizationData,
      summary: {
        averageUtilization,
        totalCommitment: {
          amount: totalCommitment.toString(),
          formatted: AWSCostUtils.formatCurrency(totalCommitment.toString()),
        },
        totalSavings: {
          amount: totalSavings.toString(),
          formatted: AWSCostUtils.formatCurrency(totalSavings.toString()),
        },
        period: timePeriod,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        granularity,
      },
    };
  } catch (error) {
    console.error("Error fetching savings plans data:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    throw new Error(`Failed to fetch savings plans data: ${errorMessage}`);
  }
}
