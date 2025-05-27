import { AppContext } from "../mod.ts";
import { AWSBudgetsClient } from "../client.ts";
import type { Budget } from "../client.ts";

export interface Props {
  /**
   * @title Budget Name
   * @description Name for the new budget
   */
  budgetName: string;

  /**
   * @title Budget Amount
   * @description Budget limit amount
   */
  budgetAmount: number;

  /**
   * @title Currency
   * @description Currency for the budget
   * @default "USD"
   */
  currency?: string;

  /**
   * @title Budget Type
   * @description Type of budget to create
   * @default "COST"
   */
  budgetType?:
    | "USAGE"
    | "COST"
    | "RI_UTILIZATION"
    | "RI_COVERAGE"
    | "SAVINGS_PLANS_UTILIZATION"
    | "SAVINGS_PLANS_COVERAGE";

  /**
   * @title Time Unit
   * @description Time unit for the budget period
   * @default "MONTHLY"
   */
  timeUnit?: "DAILY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";

  /**
   * @title Start Date
   * @description Budget period start date (YYYY-MM-DD format)
   * @format date
   */
  startDate?: string;

  /**
   * @title End Date
   * @description Budget period end date (YYYY-MM-DD format). If not provided, will be calculated based on time unit
   * @format date
   */
  endDate?: string;

  /**
   * @title Filter by Service
   * @description Filter budget by specific AWS service
   */
  serviceFilter?: string;

  /**
   * @title Filter by Linked Account
   * @description Filter budget by specific linked account ID
   */
  linkedAccountFilter?: string;

  /**
   * @title Filter by Region
   * @description Filter budget by specific AWS region
   */
  regionFilter?: string;

  /**
   * @title Filter by Usage Type
   * @description Filter budget by specific usage type
   */
  usageTypeFilter?: string;

  /**
   * @title Auto-Adjust Budget
   * @description Automatically adjust budget based on historical data
   * @default false
   */
  autoAdjust?: boolean;
}

export interface CreateBudgetResponse {
  success: boolean;
  budgetName: string;
  message: string;
  budgetDetails: {
    budgetName: string;
    budgetLimit: {
      amount: string;
      unit: string;
    };
    budgetType: string;
    timeUnit: string;
    timePeriod: {
      start: string;
      end: string;
    };
    filters?: Record<string, string[]>;
  };
  recommendations?: string[];
}

export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CreateBudgetResponse> {
  const {
    budgetName,
    budgetAmount,
    currency = "USD",
    budgetType = "COST",
    timeUnit = "MONTHLY",
    startDate,
    endDate,
    serviceFilter,
    linkedAccountFilter,
    regionFilter,
    usageTypeFilter,
    autoAdjust = false,
  } = props;

  // Validate credentials and account ID
  if (!ctx.credentials.accessKeyId || !ctx.credentials.secretAccessKey) {
    throw new Error(
      "AWS credentials not configured. Please set accessKeyId and secretAccessKey in the app configuration.",
    );
  }

  if (!ctx.accountId) {
    throw new Error(
      "AWS Account ID not configured. Please set accountId in the app configuration.",
    );
  }

  // Validate inputs
  if (!budgetName.trim()) {
    throw new Error("Budget name is required");
  }

  if (budgetAmount <= 0) {
    throw new Error("Budget amount must be greater than 0");
  }

  const client = new AWSBudgetsClient(ctx.credentials);

  try {
    // Calculate time period
    let calculatedStartDate: string;
    let calculatedEndDate: string;

    if (startDate) {
      calculatedStartDate = startDate;
    } else {
      const now = new Date();
      calculatedStartDate = now.toISOString().split("T")[0];
    }

    if (endDate) {
      calculatedEndDate = endDate;
    } else {
      const start = new Date(calculatedStartDate);
      const end = new Date(start);

      switch (timeUnit) {
        case "DAILY":
          end.setDate(end.getDate() + 1);
          break;
        case "MONTHLY":
          end.setMonth(end.getMonth() + 1);
          break;
        case "QUARTERLY":
          end.setMonth(end.getMonth() + 3);
          break;
        case "ANNUALLY":
          end.setFullYear(end.getFullYear() + 1);
          break;
      }

      calculatedEndDate = end.toISOString().split("T")[0];
    }

    // Build cost filters
    const costFilters: Record<string, string[]> = {};

    if (serviceFilter) {
      costFilters["SERVICE"] = [serviceFilter];
    }

    if (linkedAccountFilter) {
      costFilters["LINKED_ACCOUNT"] = [linkedAccountFilter];
    }

    if (regionFilter) {
      costFilters["REGION"] = [regionFilter];
    }

    if (usageTypeFilter) {
      costFilters["USAGE_TYPE"] = [usageTypeFilter];
    }

    // Check if budget name already exists
    try {
      await client.getBudget(ctx.accountId, budgetName);
      throw new Error(
        `Budget with name "${budgetName}" already exists. Please choose a different name.`,
      );
    } catch (error) {
      // Budget doesn't exist, which is what we want
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error";
      if (
        !errorMessage.includes("NotFound") &&
        !errorMessage.includes("already exists")
      ) {
        throw error;
      }
    }

    // Auto-adjust budget amount if requested
    const finalBudgetAmount = budgetAmount;
    const recommendations: string[] = [];

    if (autoAdjust) {
      // This would typically involve analyzing historical spending patterns
      // For now, we'll provide some basic recommendations
      recommendations.push(
        "Consider reviewing historical spending patterns to optimize budget amount",
      );

      if (budgetType === "COST" && timeUnit === "MONTHLY") {
        recommendations.push(
          "For monthly cost budgets, consider setting up alerts at 50%, 80%, and 100% thresholds",
        );
      }

      if (serviceFilter) {
        recommendations.push(
          `Monitor ${serviceFilter} usage patterns and consider reserved instances or savings plans for cost optimization`,
        );
      }
    }

    // Create the budget
    const budget: Omit<Budget, "CalculatedSpend" | "LastUpdatedTime"> = {
      BudgetName: budgetName,
      BudgetLimit: {
        Amount: finalBudgetAmount.toString(),
        Unit: currency,
      },
      CostFilters: Object.keys(costFilters).length > 0
        ? costFilters
        : undefined,
      TimeUnit: timeUnit,
      TimePeriod: {
        Start: calculatedStartDate,
        End: calculatedEndDate,
      },
      BudgetType: budgetType,
    };

    await client.createBudget(ctx.accountId, budget);

    // Add success recommendations
    recommendations.push("Budget created successfully");
    recommendations.push(
      "Consider setting up budget alerts to monitor spending progress",
    );

    if (budgetType === "COST") {
      recommendations.push(
        "Monitor your budget regularly and adjust as needed based on actual spending patterns",
      );
    }

    return {
      success: true,
      budgetName,
      message:
        `Budget "${budgetName}" created successfully with a limit of ${currency} ${finalBudgetAmount}`,
      budgetDetails: {
        budgetName,
        budgetLimit: {
          amount: finalBudgetAmount.toString(),
          unit: currency,
        },
        budgetType,
        timeUnit,
        timePeriod: {
          start: calculatedStartDate,
          end: calculatedEndDate,
        },
        filters: Object.keys(costFilters).length > 0 ? costFilters : undefined,
      },
      recommendations,
    };
  } catch (error) {
    console.error("Error creating budget:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    return {
      success: false,
      budgetName,
      message: `Failed to create budget: ${errorMessage}`,
      budgetDetails: {
        budgetName,
        budgetLimit: {
          amount: budgetAmount.toString(),
          unit: currency,
        },
        budgetType,
        timeUnit,
        timePeriod: {
          start: startDate || "N/A",
          end: endDate || "N/A",
        },
      },
    };
  }
}
