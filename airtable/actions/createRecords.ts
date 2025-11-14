import type { AppContext } from "../mod.ts";
import type {
  AirtableRecord,
  CreateRecordsBody,
  FieldSet,
} from "../utils/types.ts";

interface RecordToCreate {
  fields: FieldSet;
  typecast?: boolean;
}

interface Props {
  /**
   * @title Base ID
   * @description The ID of the Airtable base
   */
  baseId: string;

  /**
   * @title Table ID
   * @description The ID of the table within the base
   */
  tableId: string;

  /**
   * @title Records to Create
   * @description An array of records to create. Each record must have a fields object.
   */
  records: RecordToCreate[];

  /**
   * @title Typecast
   * @description Optional. If true, Airtable will attempt to convert cell values to the appropriate type.
   */
  typecast?: boolean;
}

interface ErrorObject {
  message: string;
  code?: string;
}

interface ResponsePayload {
  data: AirtableRecord[];
  error?: ErrorObject | null;
}

/**
 * @title Create Airtable Records
 * @description Creates one or more records in a specified table using OAuth.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ResponsePayload> => {
  try {
    if (!ctx.client) {
      return {
        data: [],
        error: { message: "OAuth authentication is required" },
      };
    }

    const validationResult = await ctx.invoke["airtable"].loaders.permissioning
      .validatePermissions({
        mode: "check",
        baseId: props.baseId,
        tableIdOrName: props.tableId,
      });

    if (
      "hasPermission" in validationResult && !validationResult.hasPermission
    ) {
      return {
        data: [],
        error: {
          message: validationResult.message || "Access denied",
        },
      };
    }

    const { baseId, tableId, records, typecast } = props;

    if (!records || records.length === 0) {
      return {
        data: [],
        error: { message: "At least one record is required" },
      };
    }

    if (records.length > 10) {
      return {
        data: [],
        error: { message: "Maximum 10 records can be created at once" },
      };
    }

    const invalidRecords = records.filter((record) => !record.fields);
    if (invalidRecords.length > 0) {
      return {
        data: [],
        error: { message: "All records must have a 'fields' property" },
      };
    }

    // Transform records to the format expected by Airtable API
    const requestBody: CreateRecordsBody = {
      records: records.map((record) => ({
        fields: record.fields,
        ...(record.typecast !== undefined && { typecast: record.typecast }),
      })),
    };

    // Apply global typecast if provided
    if (
      typecast !== undefined && !records.some((r) => r.typecast !== undefined)
    ) {
      requestBody.typecast = typecast;
    }

    // deno-lint-ignore no-explicit-any
    const response = await (ctx.client as any)["POST /v0/:baseId/:tableId"](
      { baseId, tableId },
      { body: requestBody },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        data: [],
        error: { message: `Error creating records: ${errorText}` },
      };
    }

    const result = await response.json();
    const createdRecords = result.records || [];

    return {
      data: createdRecords,
    };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";

    return {
      data: [],
      error: { message: errorMessage },
    };
  }
};

export default action;
