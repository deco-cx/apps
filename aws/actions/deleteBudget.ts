import { AppContext } from "../mod.ts";
import { AWSBudgetsClient } from "../client.ts";

export interface Props {
  /**
   * @title Budget Name
   * @description Name of the budget to delete
   */
  budgetName: string;

  /**
   * @title Confirm Deletion
   * @description Confirm that you want to delete this budget (required for safety)
   * @default false
   */
  confirmDeletion: boolean;
}

export interface DeleteBudgetResponse {
  success: boolean;
  budgetName: string;
  message: string;
  deletedBudgetInfo?: {
    budgetName: string;
    budgetAmount: string;
    budgetType: string;
    timeUnit: string;
    deletedAt: string;
  };
}

export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DeleteBudgetResponse> {
  const {
    budgetName,
    confirmDeletion,
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

  if (!confirmDeletion) {
    return {
      success: false,
      budgetName,
      message:
        "Budget deletion not confirmed. Please check the confirmation checkbox to proceed with deletion.",
    };
  }

  const client = new AWSBudgetsClient(ctx.credentials);

  try {
    // First, get the budget details for confirmation
    let budgetInfo: {
      budgetName: string;
      budgetAmount: string;
      budgetType: string;
      timeUnit: string;
    };

    try {
      const budgetResponse = await client.getBudget(ctx.accountId, budgetName);
      const budget = budgetResponse.Budget;

      budgetInfo = {
        budgetName: budget.BudgetName,
        budgetAmount: `${budget.BudgetLimit.Unit} ${budget.BudgetLimit.Amount}`,
        budgetType: budget.BudgetType,
        timeUnit: budget.TimeUnit,
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error";
      if (errorMessage.includes("NotFound")) {
        return {
          success: false,
          budgetName,
          message:
            `Budget "${budgetName}" not found. It may have already been deleted or the name may be incorrect.`,
        };
      }
      throw error;
    }

    // Delete the budget
    await client.deleteBudget(ctx.accountId, budgetName);

    return {
      success: true,
      budgetName,
      message: `Budget "${budgetName}" has been successfully deleted.`,
      deletedBudgetInfo: {
        ...budgetInfo,
        deletedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error deleting budget:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    return {
      success: false,
      budgetName,
      message: `Failed to delete budget: ${errorMessage}`,
    };
  }
}
