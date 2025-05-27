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
   */
  baseId: string;

  /**
   * @title Table ID or Name
   */
  tableIdOrName: string;

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
  const { baseId, tableIdOrName, records, typecast, performUpsert } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
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

  const response = await ctx.client["PATCH /v0/:baseId/:tableIdOrName"](
    { baseId, tableIdOrName },
    { body },
  );

  if (!response.ok) {
    throw new Error(`Error updating records: ${response.statusText}`);
  }

  return response.json();
};

export default action;
