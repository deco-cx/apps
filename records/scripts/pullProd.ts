import { existsSync } from "https://deno.land/std@0.201.0/fs/exists.ts";
import { createClient as createSQLClient, createLocalClient } from "../deps.ts";
import { getLocalDbFilename, getLocalSQLClientConfig } from "../utils.ts";
import { brightGreen, brightYellow } from "std/fmt/colors.ts";
import { getDbCredentials } from "./checkDbCredential.ts";

const PRAGMA = "PRAGMA foreign_keys=OFF";
const BEGIN_TRANSACTION = "BEGIN TRANSACTION";
const COMMIT = "COMMIT";

async function checkDumpInsertedTables(
  sqlClient: ReturnType<typeof createSQLClient>,
) {
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
  if (createLocalClient === false) {
    throw new Error("client is not defined. run it locally");
  }

  const { sitename, token } = getDbCredentials();

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
    throw new Error("Something went wrong dumping the database");
  }

  const dumpQuery = await response.text();

  const dbFilePath = getLocalDbFilename();
  const dbAlreadyExists = existsSync(dbFilePath);
  if (dbAlreadyExists) {
    const shouldProceed = confirm(
      brightGreen("You already have sqlite.db, do you want to override?"),
    );

    if (shouldProceed) {
      console.log(`Removing file: ${brightGreen(dbFilePath)}`);
      Deno.removeSync(dbFilePath);
    }
    if (!shouldProceed) {
      console.log(
        brightYellow(
          "Because of the current local database, you could have problems during the dump.",
        ),
      );
    }
  }

  const sqlClient = createLocalClient(
    getLocalSQLClientConfig(),
  );

  const sliced = extractStatements(dumpQuery);

  await sqlClient.batch(sliced, "write");

  await checkDumpInsertedTables(sqlClient);

  return "sqlite.db updated";
}

run()
  .then(console.log)
  .catch(console.error);
