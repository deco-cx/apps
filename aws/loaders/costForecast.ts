import { AppContext } from "../mod.ts";
import { AWSCostExplorerClient, AWSCostUtils } from "../client.ts";
import type { DateInterval, Expression } from "../client.ts";

export interface Props {
  /**
   * @title Forecast Period (Days)
   * @description Number of days to forecast into the future
   * @default 30
   */
  forecastDays?: number;

  /**
   * @title Custom Start Date
   * @description Custom start date for forecast (YYYY-MM-DD format). If provided, overrides forecastDays
   * @format date
   */
  startDate?: string;

  /**
   * @title Custom End Date
   * @description Custom end date for forecast (YYYY-MM-DD format). If provided, overrides forecastDays
   * @format date
   */
  endDate?: string;

  /**
   * @title Metric
   * @description The cost metric to forecast
   * @default "BlendedCost"
   */
  metric?:
    | "BlendedCost"
    | "UnblendedCost"
    | "AmortizedCost"
    | "NetUnblendedCost"
    | "NetAmortizedCost"
    | "UsageQuantity"
    | "NormalizedUsageAmount";

  /**
   * @title Granularity
   * @description The granularity of the forecast data
   * @default "DAILY"
   */
  granularity?: "DAILY" | "MONTHLY";

  /**
   * @title Prediction Interval Level
   * @description The confidence level for prediction intervals (80 = 80% confidence)
   * @default 80
   */
  predictionIntervalLevel?: number;

  /**
   * @title Filter by Service
   * @description Filter forecast by specific AWS service
   */
  serviceFilter?: string;

  /**
   * @title Include Historical Comparison
   * @description Include historical data for comparison with forecast
   * @default true
   */
  includeHistoricalComparison?: boolean;

  /**
   * @title Historical Period (Days)
   * @description Number of historical days to include for comparison
   * @default 30
   */
  historicalDays?: number;
}

export interface ForecastData {
  timePeriod: DateInterval;
  meanValue: string;
  meanValueFormatted: string;
  lowerBound: string;
  lowerBoundFormatted: string;
  upperBound: string;
  upperBoundFormatted: string;
}

export interface HistoricalData {
  timePeriod: DateInterval;
  actualCost: string;
  actualCostFormatted: string;
}

export interface CostForecastResponse {
  total: {
    amount: string;
    unit: string;
    formatted: string;
  };
  forecastData: ForecastData[];
  historicalData?: HistoricalData[];
  insights: {
    averageDailyCost: {
      amount: string;
      formatted: string;
    };
    projectedMonthlySpend: {
      amount: string;
      formatted: string;
    };
    confidenceLevel: number;
    trend: "INCREASING" | "DECREASING" | "STABLE";
    trendPercentage: number;
  };
  metadata: {
    forecastPeriod: DateInterval;
    metric: string;
    granularity: string;
    generatedAt: string;
  };
}

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CostForecastResponse> {
  const {
    forecastDays = 30,
    startDate,
    endDate,
    metric = "BlendedCost",
    granularity = "DAILY",
    predictionIntervalLevel = 80,
    serviceFilter,
    includeHistoricalComparison = true,
    historicalDays = 30,
  } = props;

  // Validate credentials
  if (!ctx.credentials.accessKeyId || !ctx.credentials.secretAccessKey) {
    throw new Error(
      "AWS credentials not configured. Please set accessKeyId and secretAccessKey in the app configuration.",
    );
  }

  const client = new AWSCostExplorerClient(ctx.credentials);

  // Determine forecast time period
  let forecastPeriod: DateInterval;
  if (startDate && endDate) {
    forecastPeriod = { Start: startDate, End: endDate };
  } else {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + forecastDays);

    forecastPeriod = {
      Start: start.toISOString().split("T")[0],
      End: end.toISOString().split("T")[0],
    };
  }

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
    // Get cost forecast
    const forecastResponse = await client.getCostForecast({
      TimePeriod: forecastPeriod,
      Metric: metric,
      Granularity: granularity,
      Filter: filter,
      PredictionIntervalLevel: predictionIntervalLevel,
    });

    const unit = forecastResponse.Total.Unit;

    // Process forecast data
    const forecastData: ForecastData[] = forecastResponse.ForecastResultsByTime
      .map((result) => ({
        timePeriod: result.TimePeriod,
        meanValue: result.MeanValue,
        meanValueFormatted: AWSCostUtils.formatCurrency(result.MeanValue, unit),
        lowerBound: result.PredictionIntervalLowerBound,
        lowerBoundFormatted: AWSCostUtils.formatCurrency(
          result.PredictionIntervalLowerBound,
          unit,
        ),
        upperBound: result.PredictionIntervalUpperBound,
        upperBoundFormatted: AWSCostUtils.formatCurrency(
          result.PredictionIntervalUpperBound,
          unit,
        ),
      }));

    // Get historical data for comparison if requested
    let historicalData: HistoricalData[] | undefined;
    if (includeHistoricalComparison) {
      const historicalPeriod = AWSCostUtils.getDateRange(historicalDays);

      try {
        const historicalResponse = await client.getCostAndUsage({
          TimePeriod: historicalPeriod,
          Granularity: granularity,
          Metrics: [metric],
          Filter: filter,
        });

        historicalData = historicalResponse.ResultsByTime.map((result) => {
          const totalMetric = result.Total[metric];
          return {
            timePeriod: result.TimePeriod,
            actualCost: totalMetric?.Amount || "0",
            actualCostFormatted: AWSCostUtils.formatCurrency(
              totalMetric?.Amount || "0",
              totalMetric?.Unit || unit,
            ),
          };
        });
      } catch (error) {
        console.warn("Could not fetch historical data for comparison:", error);
      }
    }

    // Calculate insights
    const totalForecastAmount = parseFloat(forecastResponse.Total.Amount);
    const averageDailyCost = forecastData.length > 0
      ? totalForecastAmount / forecastData.length
      : 0;

    // Estimate monthly spend based on average daily cost
    const projectedMonthlySpend = averageDailyCost * 30;

    // Calculate trend
    let trend: "INCREASING" | "DECREASING" | "STABLE" = "STABLE";
    let trendPercentage = 0;

    if (
      historicalData && historicalData.length > 0 && forecastData.length > 0
    ) {
      const historicalAverage = historicalData.reduce((sum, data) =>
        sum + parseFloat(data.actualCost), 0) / historicalData.length;

      if (historicalAverage > 0) {
        const difference = averageDailyCost - historicalAverage;
        trendPercentage = Math.abs((difference / historicalAverage) * 100);

        if (Math.abs(difference) > historicalAverage * 0.05) { // 5% threshold
          trend = difference > 0 ? "INCREASING" : "DECREASING";
        }
      }
    }

    return {
      total: {
        amount: forecastResponse.Total.Amount,
        unit: forecastResponse.Total.Unit,
        formatted: AWSCostUtils.formatCurrency(
          forecastResponse.Total.Amount,
          forecastResponse.Total.Unit,
        ),
      },
      forecastData,
      historicalData,
      insights: {
        averageDailyCost: {
          amount: averageDailyCost.toString(),
          formatted: AWSCostUtils.formatCurrency(
            averageDailyCost.toString(),
            unit,
          ),
        },
        projectedMonthlySpend: {
          amount: projectedMonthlySpend.toString(),
          formatted: AWSCostUtils.formatCurrency(
            projectedMonthlySpend.toString(),
            unit,
          ),
        },
        confidenceLevel: predictionIntervalLevel,
        trend,
        trendPercentage,
      },
      metadata: {
        forecastPeriod,
        metric,
        granularity,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error fetching cost forecast data:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    throw new Error(`Failed to fetch cost forecast data: ${errorMessage}`);
  }
}
