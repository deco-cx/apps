import { AppContext } from "../mod.ts";
import { AWSBudgetsClient } from "../client.ts";
import type { Budget } from "../client.ts";

export interface Props {
  /**
   * @title Budget Name
   * @description Name of the budget to update
   */
  budgetName: string;

  /**
   * @title New Budget Amount
   * @description New budget limit amount (optional - leave empty to keep current)
   */
  budgetAmount?: number;

  /**
   * @title New Currency
   * @description New currency for the budget (optional - leave empty to keep current)
   */
  currency?: string;

  /**
   * @title New Start Date
   * @description New budget period start date (optional - leave empty to keep current)
   * @format date
   */
  startDate?: string;

  /**
   * @title New End Date
   * @description New budget period end date (optional - leave empty to keep current)
   * @format date
   */
  endDate?: string;
}

export interface UpdateBudgetResponse {
  success: boolean;
  budgetName: string;
  message: string;
  changes: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;
  updatedBudget?: {
    budgetName: string;
    budgetLimit: {
      amount: string;
      unit: string;
    };
    timeUnit: string;
    timePeriod: {
      start: string;
      end: string;
    };
  };
}

export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UpdateBudgetResponse> {
  const {
    budgetName,
    budgetAmount,
    currency,
    startDate,
    endDate,
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

  const client = new AWSBudgetsClient(ctx.credentials);

  try {
    // Get current budget
    const currentBudgetResponse = await client.getBudget(
      ctx.accountId,
      budgetName,
    );
    const currentBudget = currentBudgetResponse.Budget;

    // Track changes
    const changes: Array<
      { field: string; oldValue: string; newValue: string }
    > = [];

    // Create updated budget object
    const updatedBudget: Budget = { ...currentBudget };

    // Update budget amount if provided
    if (budgetAmount !== undefined && budgetAmount > 0) {
      const oldAmount = currentBudget.BudgetLimit.Amount;
      const newAmount = budgetAmount.toString();

      if (oldAmount !== newAmount) {
        changes.push({
          field: "Budget Amount",
          oldValue: `${currentBudget.BudgetLimit.Unit} ${oldAmount}`,
          newValue: `${
            currency || currentBudget.BudgetLimit.Unit
          } ${newAmount}`,
        });

        updatedBudget.BudgetLimit.Amount = newAmount;
      }
    }

    // Update currency if provided
    if (currency && currency !== currentBudget.BudgetLimit.Unit) {
      changes.push({
        field: "Currency",
        oldValue: currentBudget.BudgetLimit.Unit,
        newValue: currency,
      });

      updatedBudget.BudgetLimit.Unit = currency;
    }

    // Update time period if provided
    if (startDate && startDate !== currentBudget.TimePeriod.Start) {
      changes.push({
        field: "Start Date",
        oldValue: currentBudget.TimePeriod.Start,
        newValue: startDate,
      });

      updatedBudget.TimePeriod.Start = startDate;
    }

    if (endDate && endDate !== currentBudget.TimePeriod.End) {
      changes.push({
        field: "End Date",
        oldValue: currentBudget.TimePeriod.End,
        newValue: endDate,
      });

      updatedBudget.TimePeriod.End = endDate;
    }

    // Check if any changes were made
    if (changes.length === 0) {
      return {
        success: true,
        budgetName,
        message:
          `No changes detected for budget "${budgetName}". Budget remains unchanged.`,
        changes: [],
        updatedBudget: {
          budgetName: currentBudget.BudgetName,
          budgetLimit: {
            amount: currentBudget.BudgetLimit.Amount,
            unit: currentBudget.BudgetLimit.Unit,
          },
          timeUnit: currentBudget.TimeUnit,
          timePeriod: {
            start: currentBudget.TimePeriod.Start,
            end: currentBudget.TimePeriod.End,
          },
        },
      };
    }

    // Update the budget
    await client.updateBudget(ctx.accountId, updatedBudget);

    return {
      success: true,
      budgetName,
      message:
        `Budget "${budgetName}" updated successfully with ${changes.length} change(s).`,
      changes,
      updatedBudget: {
        budgetName: updatedBudget.BudgetName,
        budgetLimit: {
          amount: updatedBudget.BudgetLimit.Amount,
          unit: updatedBudget.BudgetLimit.Unit,
        },
        timeUnit: updatedBudget.TimeUnit,
        timePeriod: {
          start: updatedBudget.TimePeriod.Start,
          end: updatedBudget.TimePeriod.End,
        },
      },
    };
  } catch (error) {
    console.error("Error updating budget:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    return {
      success: false,
      budgetName,
      message: `Failed to update budget: ${errorMessage}`,
      changes: [],
    };
  }
}
