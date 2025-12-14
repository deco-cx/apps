import { env } from "../../compat/runtime/mod.ts";

/**
 * @title {{{environment}}}
 */
export interface Props {
  environment: "production" | "development";
}

/**
 * @title Environment
 * @description Target users based from where they are accessing your site (development, testing, or production)
 * @icon code
 */
const MatchEnvironment = ({ environment }: Props) => {
  // Check both Deno and Bun deployment indicators
  const deploymentId = env.get("DENO_DEPLOYMENT_ID") || env.get("DECO_DEPLOYMENT_ID") || "";

  return environment === "production"
    ? deploymentId !== ""
    : deploymentId === "";
};

export default MatchEnvironment;
