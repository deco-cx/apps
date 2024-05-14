import { AppContext } from "../mod.ts";

export interface Props {
  sql: string;
  args: Array<string | null>;
}

export default function executeSql(
  { sql, args }: Props,
  _: Request,
  { client }: AppContext,
) {
  return client?.execute({ sql, args });
}
