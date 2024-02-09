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
  const deploymentId = Deno.env.get("DENO_DEPLOYMENT_ID") || "";

  return environment === "production"
    ? deploymentId !== ""
    : deploymentId === "";
};

export default MatchEnvironment;
