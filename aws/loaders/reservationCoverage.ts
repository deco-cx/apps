import { AppContext } from "../mod.ts";
import { AWSCostExplorerClient, AWSCostUtils } from "../client.ts";
import type { DateInterval } from "../client.ts";

export interface Props {
  /**
   * @title Time Period (Days)
   * @description Number of days to analyze reservation coverage
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
   * @description The granularity of the coverage data
   * @default "MONTHLY"
   */
  granularity?: "DAILY" | "MONTHLY";
}

export interface ReservationCoverageResponse {
  coverageData: Array<{
    timePeriod: DateInterval;
    coverageHoursPercentage: number;
    onDemandCost: {
      amount: string;
      formatted: string;
    };
  }>;
  summary: {
    averageCoverage: number;
    totalOnDemandCost: {
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
): Promise<ReservationCoverageResponse> {
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
    const response = await client.getReservationCoverage({
      TimePeriod: timePeriod,
      Granularity: granularity,
    });

    const coverageData = response.CoveragesByTime.map((coverage) => ({
      timePeriod: coverage.TimePeriod,
      coverageHoursPercentage: parseFloat(
        coverage.Total?.CoverageHours?.CoverageHoursPercentage || "0",
      ),
      onDemandCost: {
        amount: coverage.Total?.CoverageCost?.OnDemandCost || "0",
        formatted: AWSCostUtils.formatCurrency(
          coverage.Total?.CoverageCost?.OnDemandCost || "0",
        ),
      },
    }));

    const averageCoverage = coverageData.length > 0
      ? coverageData.reduce(
        (sum, data) => sum + data.coverageHoursPercentage,
        0,
      ) / coverageData.length
      : 0;

    const totalOnDemandCost = coverageData.reduce(
      (sum, data) => sum + parseFloat(data.onDemandCost.amount),
      0,
    );

    return {
      coverageData,
      summary: {
        averageCoverage,
        totalOnDemandCost: {
          amount: totalOnDemandCost.toString(),
          formatted: AWSCostUtils.formatCurrency(totalOnDemandCost.toString()),
        },
        period: timePeriod,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        granularity,
      },
    };
  } catch (error) {
    console.error("Error fetching reservation coverage data:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    throw new Error(
      `Failed to fetch reservation coverage data: ${errorMessage}`,
    );
  }
}
