import { context } from "deco/live.ts";
import { Secret } from "../website/loaders/secret.ts";
import { brightGreen, brightRed } from "std/fmt/colors.ts";

export interface StorageConfig {
  /**
   * @title Url
   * @description database url with libsql protocol
   */
  url: string;
  /**
   * @description Database authentication token
   */
  authToken: Secret;
}

export const getLocalDbFilename = () => `${Deno.cwd()}/sqlite.db`;

export const getLocalSQLClientConfig = () => ({
  url: `file://${getLocalDbFilename()}`,
  authToken: "",
});

export const getSQLClientConfig = ({ authToken, url }: StorageConfig) => {
  const useProdDb = Deno.env.get("USE_PRODUCTION_DB");
  const useLocalDB = useProdDb !== undefined && useProdDb !== "1" ||
    useProdDb === undefined && !context.isDeploy;

  if (useLocalDB) {
    console.log(
      `You're using ${
        brightGreen("local database on sqlite.db")
      }.\nTo use production database add '${
        brightGreen("USE_PRODUCTION_DB=1")
      }' environment variable.\n`,
    );
    return getLocalSQLClientConfig();
  }

  console.log(
    `You're using ${
      brightRed("production database")
    }.\nTo use local database remove '${
      brightRed("USE_PRODUCTION_DB")
    }' environment variable.\n`,
  );

  return {
    url,
    authToken: authToken?.get?.() ?? "",
  };
};
