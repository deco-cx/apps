import { HttpError } from "../../../utils/http.ts";
import { AppContext } from "../../mod.ts";
import { Permission } from "../../utils/types.ts";

export interface AddPermissionsRequest {
  bases?: Array<{
    id: string;
    name: string;
  }>;
  tables?: Array<{
    id: string;
    name: string;
    baseId?: string;
  }>;
}

export interface AddPermissionsResponse {
  success: boolean;
  permission: Permission;
  message?: string;
}

/**
 * @internal
 * @title Add New Permissions
 * @description Adds new bases and tables permissions to the current user context.
 */
const action = (
  props: AddPermissionsRequest,
  _req: Request,
  ctx: AppContext,
): AddPermissionsResponse => {
  try {
    const body: AddPermissionsRequest = props;

    if (!body.bases?.length && !body.tables?.length) {
      return {
        success: false,
        permission: ctx.permission || {},
        message: "At least one base or table must be provided",
      };
    }

    const currentPermission: Permission = ctx.permission || {
      bases: [],
      tables: [],
    };

    if (currentPermission.allCurrentAndFutureTableBases) {
      return {
        success: true,
        permission: currentPermission,
        message:
          "User already has access to all current and future bases and tables",
      };
    }

    const existingBaseIds = new Set(
      currentPermission.bases?.map((base) => base.id) || [],
    );
    const existingTableIds = new Set(
      currentPermission.tables?.map((table) => table.id) || [],
    );

    const newBases = (body.bases || []).filter((base) => {
      if (!base.id || !base.name) return false;
      return !existingBaseIds.has(base.id);
    });

    const newTables = (body.tables || []).filter((table) => {
      if (!table.id || !table.name) return false;
      return !existingTableIds.has(table.id);
    });

    const updatedPermission: Permission = {
      ...currentPermission,
      bases: [
        ...(currentPermission.bases || []),
        ...newBases,
      ],
      tables: [
        ...(currentPermission.tables || []),
        ...newTables,
      ],
    };

    ctx.permission = updatedPermission;

    return {
      success: true,
      permission: updatedPermission,
      message: `Added ${newBases.length} bases and ${newTables.length} tables`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Internal server error";
    const errorStatus = error instanceof HttpError ? error.status : 500;
    throw new HttpError(errorStatus, errorMessage);
  }
};

export default action;
