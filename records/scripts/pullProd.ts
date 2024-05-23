const token = Deno.env.get("DATABASE_AUTH_TOKEN");
const sitename = Deno.env.get("DECO_SITE_NAME");

const error = "Could not pull production database";

async function run() {
  if (!token || !sitename) {
    console.error(
      "DATABASE_AUTH_TOKEN and DECO_SITE_NAME environment variables must be set in order to pull the production database.",
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
    console.error("Could not connect to production database. Make sure your environment variables DATABASE_AUTH_TOKEN and DECO_SITE_NAME are up to date.");
    console.log("Tip: You can copy a fresh DATABASE_AUTH_TOKEN variable from the Deco.cx admin.");
    throw error;
  }

  const dumpQuery = await response.text();

  const command = new Deno.Command("sqlite3", {
    args: [
      "sqlite.db <",
      dumpQuery,
    ],
  });

  const { code, stderr, success } = await command.output();

  if (!success) {
    console.error("Could not run dump query against sqlite.db");
    console.error(`Exit code: ${code}`);
    console.error(`Process error: ${new TextDecoder().decode(stderr)}`);
    return error;
  }

  return "Production data successfully written to local file sqlite.db";
}

run()
  .then(console.log)
  .catch(console.error);
