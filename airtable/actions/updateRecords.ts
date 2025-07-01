import type { AppContext } from "../mod.ts";
import type {
  AirtableRecord,
  FieldSet,
  UpdateRecordsBody,
} from "../utils/types.ts";

interface RecordToUpdate {
  id: string;
  fields: FieldSet;
}

interface Props {
  /**
   * @title Base ID
   * @description The base containing the table with records to update
   */
  baseId: string;

  /**
   * @title Table ID
   * @description The table containing the records to update
   */
  tableId: string;

  /**
   * @title Records to Update
   * @description An array of records to update. Each record must have an ID and a fields object.
   */
  records: RecordToUpdate[];

  /**
   * @title Typecast
   * @description Optional. If true, Airtable will attempt to convert cell values to the appropriate type.
   */
  typecast?: boolean;

  /**
   * @title Perform Upsert
   * @description Optional. Specifies fields to merge on for an upsert operation.
   */
  performUpsert?: {
    fieldsToMergeOn: string[];
  };
}

/**
 * @title Update Airtable Records
 * @description Updates one or more records in a specified table using OAuth.
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

  const { baseId, tableId, records, typecast, performUpsert } = props;

  if (!records || records.length === 0) {
    return new Response("At least one record is required", { status: 400 });
  }

  if (records.length > 10) {
    return new Response("Maximum 10 records can be updated at once", {
      status: 400,
    });
  }

  const invalidRecords = records.filter((record) =>
    !record.id || !record.fields
  );
  if (invalidRecords.length > 0) {
    return new Response("All records must have 'id' and 'fields' properties", {
      status: 400,
    });
  }

  const body: UpdateRecordsBody = {
    records,
  };
  if (typecast !== undefined) {
    body.typecast = typecast;
  }
  if (performUpsert) {
    body.performUpsert = performUpsert;
  }

  const response = await ctx.client["PATCH /v0/:baseId/:tableId"](
    { baseId, tableId },
    { body },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error updating records: ${errorText}`);
  }

  return response.json();
};

export default action;
