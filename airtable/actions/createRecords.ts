import type { AppContext } from "../mod.ts";
import type {
  AirtableRecord,
  CreateRecordBody,
  FieldSet,
  MCPResponse,
} from "../utils/types.ts";

interface RecordToCreate {
  fields: FieldSet;
  typecast?: boolean;
}

interface Props {
  /**
   * @title Base ID
   * @description The base containing the table where records will be created
   */
  baseId: string;

  /**
   * @title Table ID
   * @description The table where records will be created
   */
  tableId: string;

  /**
   * @title Records to Create
   * @description An array of records to create. Each record must have a fields object with the field names and values.
   */
  records: RecordToCreate[];

  /**
   * @title Typecast
   * @description Optional. If true, Airtable will attempt to convert cell values to the appropriate type.
   */
  typecast?: boolean;
}

/**
 * @title Create Airtable Records
 * @description Creates one or more new records in a specified table using OAuth.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MCPResponse<{ records: AirtableRecord[] }>> => {
  if (!ctx.client) {
    return {
      error: "OAuth authentication is required",
      status: 401,
    };
  }

  const validationResult = await ctx.invoke["airtable"].loaders.permissioning
    .validatePermissions({
      mode: "check",
      baseId: props.baseId,
      tableIdOrName: props.tableId,
    });

  if ("hasPermission" in validationResult && !validationResult.hasPermission) {
    return {
      error: validationResult.message || "Access denied",
      status: 403,
    };
  }

  const { baseId, tableId, records, typecast } = props;

  if (!records || records.length === 0) {
    return {
      error: "At least one record is required",
      status: 400,
    };
  }

  if (records.length > 10) {
    return {
      error: "Maximum 10 records can be created at once",
      status: 400,
    };
  }

  const invalidRecords = records.filter((record) =>
    !record.fields || typeof record.fields !== "object"
  );
  if (invalidRecords.length > 0) {
    return {
      error: "All records must have a valid 'fields' object",
      status: 400,
    };
  }

  try {
    const recordsToCreate: CreateRecordBody[] = records.map((record) => ({
      fields: record.fields,
    }));

    const body: { records: CreateRecordBody[]; typecast?: boolean } = {
      records: recordsToCreate,
    };
    if (typecast !== undefined) {
      body.typecast = typecast;
    }

    const response = await ctx.client["POST /v0/:baseId/:tableId"](
      { baseId, tableId },
      { body } as unknown as Parameters<
        typeof ctx.client["POST /v0/:baseId/:tableId"]
      >[1],
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `Error creating records: ${errorText}`,
        status: response.status,
      };
    }

    const responseData = await response.json() as unknown;
    return {
      data: responseData as { records: AirtableRecord[] },
    };
  } catch (err) {
    return {
      error: `Error creating records: ${
        err instanceof Error ? err.message : String(err)
      }`,
      status: 500,
    };
  }
};

export default action;
