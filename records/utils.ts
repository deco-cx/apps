import { Secret } from "../website/loaders/secret.ts";

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

export const getSQLClientConfig = ({ authToken, url }: StorageConfig) => {
  const isLocal = !authToken?.get();
  if (isLocal) {
    return ({
      url: `file://${Deno.cwd()}/sqlite.db`,
      authToken: "",
    });
  }
  return {
    url,
    authToken: authToken?.get?.() ?? "",
  };
};
