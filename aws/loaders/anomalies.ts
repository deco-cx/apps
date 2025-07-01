import { AppContext } from "../mod.ts";
import { AWSCostExplorerClient, AWSCostUtils } from "../client.ts";
import type { DateInterval } from "../client.ts";

export interface Props {
  /**
   * @title Time Period (Days)
   * @description Number of days to look back for anomalies
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
   * @title Monitor ARN
   * @description Specific anomaly monitor ARN to filter results
   */
  monitorArn?: string;

  /**
   * @title Feedback Filter
   * @description Filter by feedback status
   */
  feedbackFilter?: "YES" | "NO" | "PLANNED_ACTIVITY";

  /**
   * @title Minimum Impact Amount
   * @description Minimum impact amount to filter anomalies (in USD)
   * @default 10
   */
  minImpactAmount?: number;

  /**
   * @title Max Results
   * @description Maximum number of anomalies to return
   * @default 50
   */
  maxResults?: number;

  /**
   * @title Include Root Cause Analysis
   * @description Include detailed root cause analysis
   * @default true
   */
  includeRootCauseAnalysis?: boolean;
}

export interface ProcessedAnomaly {
  anomalyId: string;
  dateRange: {
    start: string;
    end: string;
  };
  dimensionKey: string;
  rootCauses: Array<{
    service: string;
    region: string;
    usageType: string;
  }>;
  score: {
    max: number;
    current: number;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };
  impact: {
    maxImpact: {
      amount: string;
      formatted: string;
    };
    totalImpact: {
      amount: string;
      formatted: string;
    };
    totalActualSpend: {
      amount: string;
      formatted: string;
    };
    totalExpectedSpend: {
      amount: string;
      formatted: string;
    };
    impactPercentage: number;
  };
  monitorArn: string;
  feedback?: "YES" | "NO" | "PLANNED_ACTIVITY";
  description: string;
  recommendations: string[];
}

export interface AnomaliesResponse {
  anomalies: ProcessedAnomaly[];
  summary: {
    totalAnomalies: number;
    totalImpactAmount: {
      amount: string;
      formatted: string;
    };
    averageImpact: {
      amount: string;
      formatted: string;
    };
    severityBreakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    topServices: Array<{
      service: string;
      anomalyCount: number;
      totalImpact: string;
    }>;
    topRegions: Array<{
      region: string;
      anomalyCount: number;
      totalImpact: string;
    }>;
  };
  insights: {
    trendAnalysis: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    actionableInsights: string[];
  };
  metadata: {
    dateRange: DateInterval;
    generatedAt: string;
    monitorArn?: string;
  };
}

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AnomaliesResponse> {
  const {
    timePeriodDays = 30,
    startDate,
    endDate,
    monitorArn,
    feedbackFilter,
    minImpactAmount = 10,
    maxResults = 50,
  } = props;

  // Validate credentials
  if (!ctx.credentials.accessKeyId || !ctx.credentials.secretAccessKey) {
    throw new Error(
      "AWS credentials not configured. Please set accessKeyId and secretAccessKey in the app configuration.",
    );
  }

  if (!ctx.enableAnomalyDetection) {
    throw new Error("Anomaly detection is disabled in the app configuration.");
  }

  const client = new AWSCostExplorerClient(ctx.credentials);

  // Determine time period
  let dateInterval: DateInterval;
  if (startDate && endDate) {
    dateInterval = { Start: startDate, End: endDate };
  } else {
    dateInterval = AWSCostUtils.getDateRange(timePeriodDays);
  }

  try {
    const response = await client.getAnomalies({
      MonitorArn: monitorArn,
      DateInterval: dateInterval,
      Feedback: feedbackFilter,
      TotalImpact: minImpactAmount > 0
        ? {
          NumericOperator: "GREATER_THAN_OR_EQUAL",
          StartValue: minImpactAmount,
        }
        : undefined,
      MaxResults: maxResults,
    });

    // Process anomalies
    const processedAnomalies: ProcessedAnomaly[] = response.Anomalies.map(
      (anomaly) => {
        // Determine severity based on impact and score
        let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        const impact = anomaly.Impact.TotalImpact;
        const score = anomaly.AnomalyScore.CurrentScore;

        if (impact > 1000 || score > 90) {
          severity = "CRITICAL";
        } else if (impact > 500 || score > 70) {
          severity = "HIGH";
        } else if (impact > 100 || score > 50) {
          severity = "MEDIUM";
        } else {
          severity = "LOW";
        }

        // Generate description
        const primaryService = anomaly.RootCauses[0]?.Service ||
          "Unknown Service";
        const primaryRegion = anomaly.RootCauses[0]?.Region || "Unknown Region";
        const description =
          `Anomaly detected in ${primaryService} (${primaryRegion}) with ${
            anomaly.Impact.TotalImpactPercentage.toFixed(1)
          }% cost increase`;

        // Generate recommendations
        const recommendations: string[] = [];

        if (severity === "CRITICAL" || severity === "HIGH") {
          recommendations.push(
            "Immediately investigate the root cause and consider scaling down resources if appropriate",
          );
        }

        if (anomaly.RootCauses.length > 1) {
          recommendations.push(
            "Review multiple affected services for coordinated cost optimization",
          );
        }

        if (anomaly.Impact.TotalImpactPercentage > 50) {
          recommendations.push(
            "Consider setting up budget alerts for this service/region combination",
          );
        }

        recommendations.push(
          `Monitor ${primaryService} usage patterns and consider reserved instances or savings plans`,
        );

        return {
          anomalyId: anomaly.AnomalyId,
          dateRange: {
            start: anomaly.AnomalyStartDate,
            end: anomaly.AnomalyEndDate,
          },
          dimensionKey: anomaly.DimensionKey,
          rootCauses: anomaly.RootCauses.map((cause) => ({
            service: cause.Service,
            region: cause.Region,
            usageType: cause.UsageType,
          })),
          score: {
            max: anomaly.AnomalyScore.MaxScore,
            current: anomaly.AnomalyScore.CurrentScore,
            severity,
          },
          impact: {
            maxImpact: {
              amount: anomaly.Impact.MaxImpact.toString(),
              formatted: AWSCostUtils.formatCurrency(
                anomaly.Impact.MaxImpact.toString(),
              ),
            },
            totalImpact: {
              amount: anomaly.Impact.TotalImpact.toString(),
              formatted: AWSCostUtils.formatCurrency(
                anomaly.Impact.TotalImpact.toString(),
              ),
            },
            totalActualSpend: {
              amount: anomaly.Impact.TotalActualSpend.toString(),
              formatted: AWSCostUtils.formatCurrency(
                anomaly.Impact.TotalActualSpend.toString(),
              ),
            },
            totalExpectedSpend: {
              amount: anomaly.Impact.TotalExpectedSpend.toString(),
              formatted: AWSCostUtils.formatCurrency(
                anomaly.Impact.TotalExpectedSpend.toString(),
              ),
            },
            impactPercentage: anomaly.Impact.TotalImpactPercentage,
          },
          monitorArn: anomaly.MonitorArn,
          feedback: anomaly.Feedback,
          description,
          recommendations,
        };
      },
    );

    // Calculate summary statistics
    const totalImpact = processedAnomalies.reduce(
      (sum, anomaly) => sum + parseFloat(anomaly.impact.totalImpact.amount),
      0,
    );

    const averageImpact = processedAnomalies.length > 0
      ? totalImpact / processedAnomalies.length
      : 0;

    const severityBreakdown = {
      critical: processedAnomalies.filter((a) =>
        a.score.severity === "CRITICAL"
      ).length,
      high: processedAnomalies.filter((a) =>
        a.score.severity === "HIGH"
      ).length,
      medium: processedAnomalies.filter((a) =>
        a.score.severity === "MEDIUM"
      ).length,
      low: processedAnomalies.filter((a) => a.score.severity === "LOW").length,
    };

    // Analyze top services and regions
    const serviceMap = new Map<string, { count: number; impact: number }>();
    const regionMap = new Map<string, { count: number; impact: number }>();

    processedAnomalies.forEach((anomaly) => {
      anomaly.rootCauses.forEach((cause) => {
        // Services
        const serviceData = serviceMap.get(cause.service) ||
          { count: 0, impact: 0 };
        serviceData.count++;
        serviceData.impact += parseFloat(anomaly.impact.totalImpact.amount);
        serviceMap.set(cause.service, serviceData);

        // Regions
        const regionData = regionMap.get(cause.region) ||
          { count: 0, impact: 0 };
        regionData.count++;
        regionData.impact += parseFloat(anomaly.impact.totalImpact.amount);
        regionMap.set(cause.region, regionData);
      });
    });

    const topServices = Array.from(serviceMap.entries())
      .map(([service, data]) => ({
        service,
        anomalyCount: data.count,
        totalImpact: AWSCostUtils.formatCurrency(data.impact.toString()),
      }))
      .sort((a, b) => b.anomalyCount - a.anomalyCount)
      .slice(0, 5);

    const topRegions = Array.from(regionMap.entries())
      .map(([region, data]) => ({
        region,
        anomalyCount: data.count,
        totalImpact: AWSCostUtils.formatCurrency(data.impact.toString()),
      }))
      .sort((a, b) => b.anomalyCount - a.anomalyCount)
      .slice(0, 5);

    // Generate insights
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    if (severityBreakdown.critical > 0) {
      riskLevel = "CRITICAL";
    } else if (severityBreakdown.high > 2) {
      riskLevel = "HIGH";
    } else if (severityBreakdown.high > 0 || severityBreakdown.medium > 3) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "LOW";
    }

    const actionableInsights: string[] = [];

    if (processedAnomalies.length === 0) {
      actionableInsights.push(
        "No significant cost anomalies detected in the specified period",
      );
    } else {
      if (severityBreakdown.critical > 0) {
        actionableInsights.push(
          `${severityBreakdown.critical} critical anomalies require immediate attention`,
        );
      }

      if (topServices.length > 0) {
        actionableInsights.push(
          `${topServices[0].service} has the most anomalies (${
            topServices[0].anomalyCount
          })`,
        );
      }

      if (totalImpact > 1000) {
        actionableInsights.push(
          `Total anomaly impact of ${
            AWSCostUtils.formatCurrency(totalImpact.toString())
          } suggests systematic cost optimization opportunities`,
        );
      }
    }

    const trendAnalysis = processedAnomalies.length > 0
      ? `Detected ${processedAnomalies.length} anomalies with average impact of ${
        AWSCostUtils.formatCurrency(averageImpact.toString())
      }. Risk level: ${riskLevel}.`
      : "No significant anomalies detected. Cost patterns appear normal.";

    return {
      anomalies: processedAnomalies,
      summary: {
        totalAnomalies: processedAnomalies.length,
        totalImpactAmount: {
          amount: totalImpact.toString(),
          formatted: AWSCostUtils.formatCurrency(totalImpact.toString()),
        },
        averageImpact: {
          amount: averageImpact.toString(),
          formatted: AWSCostUtils.formatCurrency(averageImpact.toString()),
        },
        severityBreakdown,
        topServices,
        topRegions,
      },
      insights: {
        trendAnalysis,
        riskLevel,
        actionableInsights,
      },
      metadata: {
        dateRange: dateInterval,
        generatedAt: new Date().toISOString(),
        monitorArn,
      },
    };
  } catch (error) {
    console.error("Error fetching anomaly data:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    throw new Error(`Failed to fetch anomaly data: ${errorMessage}`);
  }
}
