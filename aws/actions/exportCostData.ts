import { AppContext } from "../mod.ts";
import { AWSCostExplorerClient, AWSCostUtils } from "../client.ts";
import type { DateInterval, GroupDefinition } from "../client.ts";

export interface Props {
  /**
   * @title Time Period (Days)
   * @description Number of days to export cost data for
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
   * @title Export Format
   * @description Format for the exported data
   * @default "JSON"
   */
  format?: "JSON" | "CSV";

  /**
   * @title Group By
   * @description How to group the cost data in the export
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
    | "USAGE_TYPE_GROUP";

  /**
   * @title Granularity
   * @description The granularity of the cost data
   * @default "DAILY"
   */
  granularity?: "DAILY" | "MONTHLY";

  /**
   * @title Include Summary
   * @description Include summary statistics in the export
   * @default true
   */
  includeSummary?: boolean;

  /**
   * @title Metric
   * @description Cost metric to export
   * @default "BlendedCost"
   */
  metric?:
    | "BlendedCost"
    | "UnblendedCost"
    | "AmortizedCost"
    | "NetUnblendedCost"
    | "NetAmortizedCost";
}

export interface ExportCostDataResponse {
  success: boolean;
  message: string;
  exportData: {
    format: string;
    content: string;
    filename: string;
    recordCount: number;
    timePeriod: DateInterval;
    generatedAt: string;
  };
  summary?: {
    totalCost: string;
    totalRecords: number;
    dateRange: string;
    grouping: string;
  };
}

export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ExportCostDataResponse> {
  const {
    timePeriodDays = 30,
    startDate,
    endDate,
    format = "JSON",
    groupBy = "SERVICE",
    granularity = "DAILY",
    includeSummary = true,
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
    // Fetch cost data
    const groupByConfig: GroupDefinition[] = [{
      Type: "DIMENSION",
      Key: groupBy,
    }];

    const response = await client.getCostAndUsage({
      TimePeriod: timePeriod,
      Granularity: granularity,
      Metrics: [metric],
      GroupBy: groupByConfig,
    });

    // Process the data for export
    const exportRecords: Array<{
      date: string;
      group: string;
      amount: string;
      unit: string;
      estimated: boolean;
    }> = [];

    let totalCost = 0;

    response.ResultsByTime.forEach((result) => {
      const date = result.TimePeriod.Start;

      if (result.Groups && result.Groups.length > 0) {
        result.Groups.forEach((group) => {
          const groupName = group.Keys[0] || "Unknown";
          const cost = parseFloat(group.Metrics[metric]?.Amount || "0");
          const unit = group.Metrics[metric]?.Unit || "USD";

          exportRecords.push({
            date,
            group: groupName,
            amount: cost.toString(),
            unit,
            estimated: result.Estimated,
          });

          totalCost += cost;
        });
      } else {
        // No grouping
        const cost = parseFloat(result.Total[metric]?.Amount || "0");
        const unit = result.Total[metric]?.Unit || "USD";

        exportRecords.push({
          date,
          group: "Total",
          amount: cost.toString(),
          unit,
          estimated: result.Estimated,
        });

        totalCost += cost;
      }
    });

    // Generate export content based on format
    let content: string;
    let filename: string;

    if (format === "CSV") {
      // Generate CSV
      const csvHeaders = ["Date", "Group", "Amount", "Unit", "Estimated"];
      const csvRows = exportRecords.map((record) => [
        record.date,
        `"${record.group.replace(/"/g, '""')}"`, // Escape quotes in CSV
        record.amount,
        record.unit,
        record.estimated.toString(),
      ]);

      content = [csvHeaders.join(","), ...csvRows.map((row) => row.join(","))]
        .join("\n");
      filename = `aws-cost-export-${timePeriod.Start}-to-${timePeriod.End}.csv`;
    } else {
      // Generate JSON
      const jsonData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          timePeriod,
          groupBy,
          granularity,
          metric,
          totalRecords: exportRecords.length,
        },
        summary: includeSummary
          ? {
            totalCost: totalCost.toString(),
            formattedTotalCost: AWSCostUtils.formatCurrency(
              totalCost.toString(),
            ),
            recordCount: exportRecords.length,
            dateRange: `${timePeriod.Start} to ${timePeriod.End}`,
            currency: exportRecords[0]?.unit || "USD",
          }
          : undefined,
        data: exportRecords,
      };

      content = JSON.stringify(jsonData, null, 2);
      filename =
        `aws-cost-export-${timePeriod.Start}-to-${timePeriod.End}.json`;
    }

    const summary = includeSummary
      ? {
        totalCost: AWSCostUtils.formatCurrency(totalCost.toString()),
        totalRecords: exportRecords.length,
        dateRange: `${timePeriod.Start} to ${timePeriod.End}`,
        grouping: groupBy,
      }
      : undefined;

    return {
      success: true,
      message:
        `Successfully exported ${exportRecords.length} cost records in ${format} format`,
      exportData: {
        format,
        content,
        filename,
        recordCount: exportRecords.length,
        timePeriod,
        generatedAt: new Date().toISOString(),
      },
      summary,
    };
  } catch (error) {
    console.error("Error exporting cost data:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    return {
      success: false,
      message: `Failed to export cost data: ${errorMessage}`,
      exportData: {
        format,
        content: "",
        filename: "",
        recordCount: 0,
        timePeriod,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
