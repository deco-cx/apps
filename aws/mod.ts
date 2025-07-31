import type { App, FnContext } from "@deco/deco";
import { AWSCredentials } from "./client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Props {
  /**
   * @title AWS Access Key ID
   * @description Your AWS access key ID for authentication
   */
  accessKeyId?: string;

  /**
   * @title AWS Secret Access Key
   * @description Your AWS secret access key for authentication
   */
  secretAccessKey?: string;

  /**
   * @title AWS Region
   * @description The AWS region to use (defaults to us-east-1)
   * @default "us-east-1"
   */
  region?: string;

  /**
   * @title AWS Session Token
   * @description Optional session token for temporary credentials
   */
  sessionToken?: string;

  /**
   * @title AWS Account ID
   * @description Your AWS account ID (required for some operations like budgets)
   */
  accountId?: string;

  /**
   * @title Default Currency
   * @description Default currency for cost displays
   * @default "USD"
   */
  defaultCurrency?: string;

  /**
   * @title Enable Cost Anomaly Detection
   * @description Enable fetching and monitoring of cost anomalies
   * @default true
   */
  enableAnomalyDetection?: boolean;

  /**
   * @title Enable Budget Monitoring
   * @description Enable budget monitoring and alerts
   * @default true
   */
  enableBudgetMonitoring?: boolean;
}

export interface State extends Props {
  credentials: AWSCredentials;
}

/**
 * @title AWS
 * @appName aws
 * @description Track cloud costs, budgets, and billing insights using AWS tools.
 * @category Analytics
 * @logo https://assets.decocache.com/mcp/ece686cd-c380-41e8-97c8-34616a3bf5ba/AWS.svg
 */
export default function App(state: Props): App<Manifest, State> {
  // Validate required credentials
  if (!state.accessKeyId || !state.secretAccessKey) {
    console.warn(
      "AWS app: Missing required credentials (accessKeyId or secretAccessKey)",
    );
  }

  const credentials: AWSCredentials = {
    accessKeyId: state.accessKeyId || "",
    secretAccessKey: state.secretAccessKey || "",
    region: state.region || "us-east-1",
    sessionToken: state.sessionToken,
  };

  const newState: State = {
    ...state,
    credentials,
    defaultCurrency: state.defaultCurrency || "USD",
    enableAnomalyDetection: state.enableAnomalyDetection ?? true,
    enableBudgetMonitoring: state.enableBudgetMonitoring ?? true,
  };

  return {
    state: newState,
    manifest,
  };
}

export type AppContext = FnContext<State, Manifest>;
