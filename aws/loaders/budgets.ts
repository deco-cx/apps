import { AppContext } from "../mod.ts";
import { AWSBudgetsClient, AWSCostUtils } from "../client.ts";
import type { Budget } from "../client.ts";

export interface Props {
  /**
   * @title Budget Name Filter
   * @description Filter by specific budget name (optional)
   */
  budgetName?: string;

  /**
   * @title Max Results
   * @description Maximum number of budgets to return
   * @default 20
   */
  maxResults?: number;

  /**
   * @title Include Budget Performance
   * @description Calculate budget performance metrics
   * @default true
   */
  includeBudgetPerformance?: boolean;
}

export interface BudgetPerformance {
  budgetName: string;
  budgetLimit: {
    amount: string;
    unit: string;
    formatted: string;
  };
  actualSpend: {
    amount: string;
    unit: string;
    formatted: string;
  };
  forecastedSpend?: {
    amount: string;
    unit: string;
    formatted: string;
  };
  utilizationPercentage: number;
  remainingBudget: {
    amount: string;
    unit: string;
    formatted: string;
  };
  status: "UNDER_BUDGET" | "ON_TRACK" | "OVER_BUDGET" | "FORECASTED_OVER";
  timeUnit: string;
  timePeriod: {
    start: string;
    end: string;
  };
  lastUpdated: string;
  budgetType: string;
  daysRemaining?: number;
  projectedOverage?: {
    amount: string;
    formatted: string;
  };
}

export interface BudgetsResponse {
  budgets: BudgetPerformance[];
  summary: {
    totalBudgets: number;
    totalBudgetAmount: {
      amount: string;
      unit: string;
      formatted: string;
    };
    totalActualSpend: {
      amount: string;
      unit: string;
      formatted: string;
    };
    averageUtilization: number;
    budgetsOverLimit: number;
    budgetsOnTrack: number;
    budgetsUnderUtilized: number;
  };
  alerts: Array<{
    budgetName: string;
    alertType: "OVER_BUDGET" | "FORECASTED_OVER" | "HIGH_UTILIZATION";
    message: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }>;
  metadata: {
    accountId: string;
    generatedAt: string;
    currency: string;
  };
}

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BudgetsResponse> {
  const {
    budgetName,
    maxResults = 20,
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

  const client = new AWSBudgetsClient(ctx.credentials);

  try {
    let budgets: Budget[];

    if (budgetName) {
      // Get specific budget
      const response = await client.getBudget(ctx.accountId, budgetName);
      budgets = [response.Budget];
    } else {
      // Get all budgets
      const response = await client.getBudgets({
        AccountId: ctx.accountId,
        MaxResults: maxResults,
      });
      budgets = response.Budgets;
    }

    // Process budget data and calculate performance metrics
    const budgetPerformances: BudgetPerformance[] = budgets.map((budget) => {
      const limitAmount = parseFloat(budget.BudgetLimit.Amount);
      const actualAmount = parseFloat(
        budget.CalculatedSpend.ActualSpend.Amount,
      );
      const forecastedAmount = budget.CalculatedSpend.ForecastedSpend
        ? parseFloat(budget.CalculatedSpend.ForecastedSpend.Amount)
        : undefined;

      const utilizationPercentage = limitAmount > 0
        ? (actualAmount / limitAmount) * 100
        : 0;
      const remainingAmount = Math.max(0, limitAmount - actualAmount);

      // Determine status
      let status:
        | "UNDER_BUDGET"
        | "ON_TRACK"
        | "OVER_BUDGET"
        | "FORECASTED_OVER";
      if (actualAmount > limitAmount) {
        status = "OVER_BUDGET";
      } else if (forecastedAmount && forecastedAmount > limitAmount) {
        status = "FORECASTED_OVER";
      } else if (utilizationPercentage > 80) {
        status = "ON_TRACK";
      } else {
        status = "UNDER_BUDGET";
      }

      // Calculate days remaining in budget period
      const endDate = new Date(budget.TimePeriod.End);
      const now = new Date();
      const daysRemaining = Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      );

      // Calculate projected overage if forecasted to exceed
      let projectedOverage: { amount: string; formatted: string } | undefined;
      if (forecastedAmount && forecastedAmount > limitAmount) {
        const overageAmount = forecastedAmount - limitAmount;
        projectedOverage = {
          amount: overageAmount.toString(),
          formatted: AWSCostUtils.formatCurrency(
            overageAmount.toString(),
            budget.BudgetLimit.Unit,
          ),
        };
      }

      return {
        budgetName: budget.BudgetName,
        budgetLimit: {
          amount: budget.BudgetLimit.Amount,
          unit: budget.BudgetLimit.Unit,
          formatted: AWSCostUtils.formatCurrency(
            budget.BudgetLimit.Amount,
            budget.BudgetLimit.Unit,
          ),
        },
        actualSpend: {
          amount: budget.CalculatedSpend.ActualSpend.Amount,
          unit: budget.CalculatedSpend.ActualSpend.Unit,
          formatted: AWSCostUtils.formatCurrency(
            budget.CalculatedSpend.ActualSpend.Amount,
            budget.CalculatedSpend.ActualSpend.Unit,
          ),
        },
        forecastedSpend: budget.CalculatedSpend.ForecastedSpend
          ? {
            amount: budget.CalculatedSpend.ForecastedSpend.Amount,
            unit: budget.CalculatedSpend.ForecastedSpend.Unit,
            formatted: AWSCostUtils.formatCurrency(
              budget.CalculatedSpend.ForecastedSpend.Amount,
              budget.CalculatedSpend.ForecastedSpend.Unit,
            ),
          }
          : undefined,
        utilizationPercentage,
        remainingBudget: {
          amount: remainingAmount.toString(),
          unit: budget.BudgetLimit.Unit,
          formatted: AWSCostUtils.formatCurrency(
            remainingAmount.toString(),
            budget.BudgetLimit.Unit,
          ),
        },
        status,
        timeUnit: budget.TimeUnit,
        timePeriod: {
          start: budget.TimePeriod.Start,
          end: budget.TimePeriod.End,
        },
        lastUpdated: budget.LastUpdatedTime,
        budgetType: budget.BudgetType,
        daysRemaining,
        projectedOverage,
      };
    });

    // Calculate summary statistics
    const totalBudgetAmount = budgetPerformances.reduce(
      (sum, budget) => sum + parseFloat(budget.budgetLimit.amount),
      0,
    );

    const totalActualSpend = budgetPerformances.reduce(
      (sum, budget) => sum + parseFloat(budget.actualSpend.amount),
      0,
    );

    const averageUtilization = budgetPerformances.length > 0
      ? budgetPerformances.reduce(
        (sum, budget) => sum + budget.utilizationPercentage,
        0,
      ) / budgetPerformances.length
      : 0;

    const budgetsOverLimit = budgetPerformances.filter((b) =>
      b.status === "OVER_BUDGET"
    ).length;
    const budgetsOnTrack = budgetPerformances.filter((b) =>
      b.status === "ON_TRACK"
    ).length;
    const budgetsUnderUtilized =
      budgetPerformances.filter((b) => b.status === "UNDER_BUDGET").length;

    // Generate alerts
    const alerts: Array<{
      budgetName: string;
      alertType: "OVER_BUDGET" | "FORECASTED_OVER" | "HIGH_UTILIZATION";
      message: string;
      severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    }> = [];

    budgetPerformances.forEach((budget) => {
      if (budget.status === "OVER_BUDGET") {
        alerts.push({
          budgetName: budget.budgetName,
          alertType: "OVER_BUDGET",
          message: `Budget "${budget.budgetName}" has exceeded its limit by ${
            budget.utilizationPercentage.toFixed(1)
          }%`,
          severity: "CRITICAL",
        });
      } else if (budget.status === "FORECASTED_OVER") {
        alerts.push({
          budgetName: budget.budgetName,
          alertType: "FORECASTED_OVER",
          message:
            `Budget "${budget.budgetName}" is forecasted to exceed its limit. Projected overage: ${
              budget.projectedOverage?.formatted || "N/A"
            }`,
          severity: "HIGH",
        });
      } else if (budget.utilizationPercentage > 80) {
        alerts.push({
          budgetName: budget.budgetName,
          alertType: "HIGH_UTILIZATION",
          message: `Budget "${budget.budgetName}" is at ${
            budget.utilizationPercentage.toFixed(1)
          }% utilization`,
          severity: budget.utilizationPercentage > 90 ? "HIGH" : "MEDIUM",
        });
      }
    });

    const defaultCurrency = ctx.defaultCurrency || "USD";

    return {
      budgets: budgetPerformances,
      summary: {
        totalBudgets: budgetPerformances.length,
        totalBudgetAmount: {
          amount: totalBudgetAmount.toString(),
          unit: defaultCurrency,
          formatted: AWSCostUtils.formatCurrency(
            totalBudgetAmount.toString(),
            defaultCurrency,
          ),
        },
        totalActualSpend: {
          amount: totalActualSpend.toString(),
          unit: defaultCurrency,
          formatted: AWSCostUtils.formatCurrency(
            totalActualSpend.toString(),
            defaultCurrency,
          ),
        },
        averageUtilization,
        budgetsOverLimit,
        budgetsOnTrack,
        budgetsUnderUtilized,
      },
      alerts,
      metadata: {
        accountId: ctx.accountId,
        generatedAt: new Date().toISOString(),
        currency: defaultCurrency,
      },
    };
  } catch (error) {
    console.error("Error fetching budget data:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    throw new Error(`Failed to fetch budget data: ${errorMessage}`);
  }
}
