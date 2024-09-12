import { context } from "@deco/deco";
export * from "https://esm.sh/drizzle-orm@0.30.10/libsql";
export * from "npm:@libsql/client@0.7.0";
export const createLocalClient = !context.isDeploy &&
  (await import("npm:@libsql/client@0.7.0/node")).createClient;
