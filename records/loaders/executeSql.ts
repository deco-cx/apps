import type { InArgs, InStatement } from "https://esm.sh/@libsql/client@0.6.0";
import type { AppContext } from "../mod.ts";

interface Props {
  sql: string;
  args?: InArgs;
}

async function executeSql(props: Props, _: Request, ctx: AppContext) {
  const exec = await ctx.sqlClient.execute(props as InStatement);
  return exec.rows;
}

export default executeSql;
