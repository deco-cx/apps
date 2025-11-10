import type { AppContext } from "../mod.ts";
import type {
  AirtableRecord,
  FieldSet,
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
): Promise<{ records: AirtableRecord[] } | Response> => {
  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const validationResult = await ctx.invoke["airtable"].loaders.permissioning
    .validatePermissions({
      mode: "check",
      baseId: props.baseId,
      tableIdOrName: props.tableId,
    });

  if ("hasPermission" in validationResult && !validationResult.hasPermission) {
    return new Response(validationResult.message || "Access denied", {
      status: 403,
    });
  }

  const { baseId, tableId, records, typecast } = props;

  if (!records || records.length === 0) {
    return new Response("At least one record is required", { status: 400 });
  }

  if (records.length > 10) {
    return new Response("Maximum 10 records can be created at once", {
      status: 400,
    });
  }

  const invalidRecords = records.filter((record) =>
    !record.fields || typeof record.fields !== "object"
  );
  if (invalidRecords.length > 0) {
    return new Response("All records must have a valid 'fields' object", {
      status: 400,
    });
  }

  const body: { records: RecordToCreate[]; typecast?: boolean } = {
    records,
  };
  if (typecast !== undefined) {
    body.typecast = typecast;
  }

  const response = await ctx.client["POST /v0/:baseId/:tableId"](
    { baseId, tableId },
    { body },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error creating records: ${errorText}`);
  }

  return response.json();
};

export default action;

