import { AppContext } from "../../mod.ts";
import { AirtableTable } from "../../utils/types.ts";

type BaseWithTables = {
  id: string;
  name: string;
  type: "base";
  tables: Record<string, AirtableTable & { type: "table" }>;
};

type LegacyTable = {
  id: string;
  name: string;
  type: "table";
};

type PermissionResult = BaseWithTables | LegacyTable;

/**
 * @name LIST_ALLOWED_TABLES_BASES
 * @title Get Allowed Tables and Bases
 * @description Fetches the allowed tables and bases for the current user.
 */
const loader = (
  _: unknown,
  _req: Request,
  ctx: AppContext,
) => {
  const { permission } = ctx;

  if (permission?.allCurrentAndFutureTableBases) {
    return {
      allCurrentAndFutureTableBases: true,
      description: "AI can access all current and future table bases",
    };
  }

  if (!permission?.bases || !permission?.tables) {
    return { permission: {} };
  }

  const basesMap = permission.bases.reduce(
    (acc, base) => {
      if (base.id) {
        acc[base.id] = {
          id: base.id,
          name: base.name || base.id,
          type: "base",
          tables: {},
        };
      }
      return acc;
    },
    {} as Record<string, BaseWithTables>,
  );

  const permissionWithBases = permission.tables.reduce(
    (acc, table) => {
      if (table.baseId && basesMap[table.baseId]) {
        if (!acc[table.baseId]) {
          acc[table.baseId] = {
            id: table.baseId,
            name: basesMap[table.baseId].name,
            type: "base",
            tables: {},
          };
        }
        (acc[table.baseId] as BaseWithTables).tables[table.id] = {
          id: table.id,
          name: table.name || table.id,
          type: "table",
        };
      } else if (!table.baseId) {
        acc[table.id] = {
          id: table.id,
          name: table.name || table.id,
          type: "table",
        } as LegacyTable;
      }
      return acc;
    },
    {} as Record<string, PermissionResult>,
  );

  return {
    permission: permissionWithBases,
  };
};

export default loader;
