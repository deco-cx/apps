import { createClient as createSQLClient } from "../deps.ts";
import { getLocalSQLClientConfig } from "../utils.ts";

const PRAGMA = "PRAGMA foreign_keys=OFF";
const BEGIN_TRANSACTION = "BEGIN TRANSACTION";
const COMMIT = "COMMIT";

const token = Deno.env.get("DATABASE_AUTH_TOKEN");
const sitename = Deno.env.get("DECO_SITE_NAME");

const error = "Could not pull production database";

function extractStatements(sql: string) {
  // Split the SQL string by semicolons to get individual statements
  let statements = sql.split(";");

  // Trim whitespace and filter out empty statements
  statements = statements.map((stmt) => stmt.trim()).filter((stmt) =>
    stmt.length > 0
  );

  return statements.filter((stmt) =>
    !(stmt === BEGIN_TRANSACTION || stmt === COMMIT || stmt === PRAGMA)
  );
}

async function run() {
  if (!token || !sitename) {
    const link = `https://admin.deco.cx/sites/${
      Deno.env.get("DECO_SITE_NAME")
    }/spaces/Settings`;

    console.log(
      `Token not setted up. Open ${link} to get database credentials.`,
    );

    throw error;
  }

  const productionDumpUrl = `https://${sitename}-decocx.turso.io/dump`;

  const response = await fetch(
    productionDumpUrl,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    console.error(
      "Could not connect to production database. Make sure your environment variables DATABASE_AUTH_TOKEN and DECO_SITE_NAME are up to date.",
    );
    console.log(
      "Tip: You can copy a fresh DATABASE_AUTH_TOKEN variable from the Deco.cx admin.",
    );
    throw error;
  }

  const dumpQuery = await response.text();

  const sqlClient = createSQLClient(
    getLocalSQLClientConfig(),
  );

  const sliced = extractStatements(dumpQuery);

  await sqlClient.batch(sliced, "write");
  const select = await sqlClient.execute(`SELECT 
        m.name as "tableName", p.name as "columnName", p.type as "columnType", p."notnull" as "notNull", p.dflt_value as "defaultValue", p.pk as pk
        FROM sqlite_master AS m JOIN pragma_table_info(m.name) AS p
        WHERE m.type = 'table' and m.tbl_name != 'sqlite_sequence' and m.tbl_name != 'sqlite_stat1' and m.tbl_name != '_litestream_seq' and m.tbl_name != '_litestream_lock' and m.tbl_name != 'libsql_wasm_func_table' and m.tbl_name != '_cf_KV';`);

  if (select.rows.length > 0) {
    return "Production data successfully written to local file sqlite.db";
  } else {
    return "Failed to dump database";
  }
}

run()
  .then(console.log)
  .catch(console.error);
