import { context } from "@deco/deco";
export * from "npm:drizzle-orm@0.43.1/libsql";
export * from "npm:@libsql/client@0.15.4";
export const createLocalClient = !context.isDeploy &&
  (await import("npm:@libsql/client@0.15.4/node")).createClient;
