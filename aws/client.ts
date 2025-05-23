import { createHash, createHmac } from "node:crypto";

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  sessionToken?: string | null;
}

export interface DateInterval {
  Start: string; // Format: YYYY-MM-DD
  End: string; // Format: YYYY-MM-DD
}

export interface GroupDefinition {
  Type: "DIMENSION" | "TAG" | "COST_CATEGORY";
  Key: string;
}

export interface Metric {
  Key:
    | "BlendedCost"
    | "UnblendedCost"
    | "AmortizedCost"
    | "NetUnblendedCost"
    | "NetAmortizedCost"
    | "UsageQuantity"
    | "NormalizedUsageAmount";
  MatchOptions?: Array<
    | "EQUALS"
    | "ABSENT"
    | "STARTS_WITH"
    | "ENDS_WITH"
    | "CONTAINS"
    | "CASE_SENSITIVE"
    | "CASE_INSENSITIVE"
  >;
  Values?: string[];
}

export interface Expression {
  Or?: Expression[];
  And?: Expression[];
  Not?: Expression;
  Dimensions?: {
    Key: string;
    Values: string[];
    MatchOptions?: Array<
      | "EQUALS"
      | "ABSENT"
      | "STARTS_WITH"
      | "ENDS_WITH"
      | "CONTAINS"
      | "CASE_SENSITIVE"
      | "CASE_INSENSITIVE"
    >;
  };
  Tags?: {
    Key: string;
    Values: string[];
    MatchOptions?: Array<
      | "EQUALS"
      | "ABSENT"
      | "STARTS_WITH"
      | "ENDS_WITH"
      | "CONTAINS"
      | "CASE_SENSITIVE"
      | "CASE_INSENSITIVE"
    >;
  };
  CostCategories?: {
    Key: string;
    Values: string[];
    MatchOptions?: Array<
      | "EQUALS"
      | "ABSENT"
      | "STARTS_WITH"
      | "ENDS_WITH"
      | "CONTAINS"
      | "CASE_SENSITIVE"
      | "CASE_INSENSITIVE"
    >;
  };
}

export interface GetCostAndUsageRequest {
  TimePeriod: DateInterval;
  Granularity: "DAILY" | "MONTHLY" | "HOURLY";
  Metrics: string[];
  GroupBy?: GroupDefinition[];
  Filter?: Expression;
  NextPageToken?: string;
}

export interface GetCostAndUsageResponse {
  NextPageToken?: string;
  GroupDefinitions?: GroupDefinition[];
  ResultsByTime: Array<{
    TimePeriod: DateInterval;
    Total: Record<string, {
      Amount: string;
      Unit: string;
    }>;
    Groups?: Array<{
      Keys: string[];
      Metrics: Record<string, {
        Amount: string;
        Unit: string;
      }>;
    }>;
    Estimated: boolean;
  }>;
  DimensionKey?: string;
}

export interface GetCostForecastRequest {
  TimePeriod: DateInterval;
  Metric:
    | "BlendedCost"
    | "UnblendedCost"
    | "AmortizedCost"
    | "NetUnblendedCost"
    | "NetAmortizedCost"
    | "UsageQuantity"
    | "NormalizedUsageAmount";
  Granularity: "DAILY" | "MONTHLY";
  Filter?: Expression;
  PredictionIntervalLevel?: number;
}

export interface GetCostForecastResponse {
  Total: {
    Amount: string;
    Unit: string;
  };
  ForecastResultsByTime: Array<{
    TimePeriod: DateInterval;
    MeanValue: string;
    PredictionIntervalLowerBound: string;
    PredictionIntervalUpperBound: string;
  }>;
}

export interface GetDimensionValuesRequest {
  SearchString?: string;
  TimePeriod: DateInterval;
  Dimension:
    | "AZ"
    | "INSTANCE_TYPE"
    | "KEY"
    | "LINKED_ACCOUNT"
    | "OPERATION"
    | "PURCHASE_TYPE"
    | "REGION"
    | "SERVICE"
    | "USAGE_TYPE"
    | "USAGE_TYPE_GROUP"
    | "RECORD_TYPE"
    | "OPERATING_SYSTEM"
    | "TENANCY"
    | "SCOPE"
    | "PLATFORM"
    | "SUBSCRIPTION_ID"
    | "LEGAL_ENTITY_NAME"
    | "DEPLOYMENT_OPTION"
    | "DATABASE_ENGINE"
    | "CACHE_ENGINE"
    | "INSTANCE_TYPE_FAMILY"
    | "BILLING_ENTITY"
    | "RESERVATION_ID"
    | "RESOURCE_ID"
    | "RIGHTSIZING_TYPE"
    | "SAVINGS_PLANS_TYPE"
    | "SAVINGS_PLAN_ARN"
    | "PAYMENT_OPTION"
    | "AGREEMENT_END_DATE_TIME_AFTER"
    | "AGREEMENT_END_DATE_TIME_BEFORE"
    | "INVOICING_ENTITY"
    | "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
    | "ANOMALY_TOTAL_IMPACT_PERCENTAGE";
  Context?: "COST_AND_USAGE" | "RESERVATIONS" | "SAVINGS_PLANS";
  Filter?: Expression;
  SortBy?: Array<{
    Key: string;
    SortOrder: "ASCENDING" | "DESCENDING";
  }>;
  NextPageToken?: string;
  MaxResults?: number;
}

export interface GetDimensionValuesResponse {
  DimensionValues: Array<{
    Value: string;
    Attributes: Record<string, string>;
    MatchOptions: string[];
  }>;
  ReturnSize: number;
  TotalSize: number;
  NextPageToken?: string;
}

export interface GetAnomaliesRequest {
  MonitorArn?: string;
  DateInterval: DateInterval;
  Feedback?: "YES" | "NO" | "PLANNED_ACTIVITY";
  TotalImpact?: {
    NumericOperator:
      | "EQUAL"
      | "GREATER_THAN_OR_EQUAL"
      | "LESS_THAN_OR_EQUAL"
      | "GREATER_THAN"
      | "LESS_THAN"
      | "BETWEEN";
    StartValue: number;
    EndValue?: number;
  };
  NextPageToken?: string;
  MaxResults?: number;
}

export interface AnomalyData {
  AnomalyId: string;
  AnomalyStartDate: string;
  AnomalyEndDate: string;
  DimensionKey: string;
  RootCauses: Array<{
    Service: string;
    Region: string;
    UsageType: string;
  }>;
  AnomalyScore: {
    MaxScore: number;
    CurrentScore: number;
  };
  Impact: {
    MaxImpact: number;
    TotalImpact: number;
    TotalActualSpend: number;
    TotalExpectedSpend: number;
    TotalImpactPercentage: number;
  };
  MonitorArn: string;
  Feedback?: "YES" | "NO" | "PLANNED_ACTIVITY";
}

export interface GetAnomaliesResponse {
  Anomalies: AnomalyData[];
  NextPageToken?: string;
}

export interface GetBudgetsRequest {
  AccountId: string;
  MaxResults?: number;
  NextToken?: string;
}

export interface Budget {
  BudgetName: string;
  BudgetLimit: {
    Amount: string;
    Unit: string;
  };
  CostFilters?: Record<string, string[]>;
  TimeUnit: "DAILY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  TimePeriod: {
    Start: string;
    End: string;
  };
  CalculatedSpend: {
    ActualSpend: {
      Amount: string;
      Unit: string;
    };
    ForecastedSpend?: {
      Amount: string;
      Unit: string;
    };
  };
  BudgetType:
    | "USAGE"
    | "COST"
    | "RI_UTILIZATION"
    | "RI_COVERAGE"
    | "SAVINGS_PLANS_UTILIZATION"
    | "SAVINGS_PLANS_COVERAGE";
  LastUpdatedTime: string;
}

export interface GetBudgetsResponse {
  Budgets: Budget[];
  NextToken?: string;
}

export class AWSCostExplorerClient {
  private credentials: AWSCredentials;
  private baseUrl: string;

  constructor(credentials: AWSCredentials) {
    this.credentials = credentials;
    this.baseUrl = `https://ce.us-east-1.amazonaws.com`;
  }

  private signRequest(
    method: string,
    path: string,
    body: string,
    headers: Record<string, string>,
  ): Record<string, string> {
    const now = new Date();
    const isoDateTime = now.toISOString().replace(/[:\-]|\.\d{3}/g, "");
    const isoDate = isoDateTime.substr(0, 8);

    // AWS Cost Explorer is only available in us-east-1
    const region = "us-east-1";
    const service = "ce";

    // Create canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map((key) => `${key.toLowerCase()}:${headers[key]}`)
      .join("\n");

    const signedHeaders = Object.keys(headers)
      .sort()
      .map((key) => key.toLowerCase())
      .join(";");

    const bodyHash = createHash("sha256").update(body).digest("hex");

    const canonicalRequest = [
      method,
      path,
      "", // query string
      canonicalHeaders,
      "",
      signedHeaders,
      bodyHash,
    ].join("\n");

    // Create string to sign
    const credentialScope = `${isoDate}/${region}/${service}/aws4_request`;
    const algorithm = "AWS4-HMAC-SHA256";
    const canonicalRequestHash = createHash("sha256").update(canonicalRequest)
      .digest("hex");

    const stringToSign = [
      algorithm,
      isoDateTime,
      credentialScope,
      canonicalRequestHash,
    ].join("\n");

    // Calculate signature
    const kDate = createHmac(
      "sha256",
      `AWS4${this.credentials.secretAccessKey}`,
    ).update(isoDate).digest();
    const kRegion = createHmac("sha256", kDate).update(region).digest();
    const kService = createHmac("sha256", kRegion).update(service).digest();
    const kSigning = createHmac("sha256", kService).update("aws4_request")
      .digest();
    const signature = createHmac("sha256", kSigning).update(stringToSign)
      .digest("hex");

    const authorizationHeader =
      `${algorithm} Credential=${this.credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      ...headers,
      "Authorization": authorizationHeader,
      "X-Amz-Date": isoDateTime,
      ...(this.credentials.sessionToken &&
        { "X-Amz-Security-Token": this.credentials.sessionToken }),
    };
  }

  // deno-lint-ignore no-explicit-any
  private async makeRequest<T>(target: string, body: any): Promise<T> {
    const requestBody = JSON.stringify(body);
    const headers = {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": target,
      "Host": new URL(this.baseUrl).host,
      "User-Agent": "deco-aws-app/1.0",
      "Accept": "application/json",
      "Content-Length": requestBody.length.toString(),
    };

    const signedHeaders = await this.signRequest(
      "POST",
      "/",
      requestBody,
      headers,
    );

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: signedHeaders,
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AWS API Error (${response.status}): ${errorText}`);
    }

    // Check if response has content
    const responseText = await response.text();

    if (!responseText) {
      throw new Error("AWS API returned empty response");
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error
        ? parseError.message
        : "Unknown JSON parse error";
      throw new Error(
        `Failed to parse AWS API response as JSON: ${errorMessage}`,
      );
    }
  }

  getCostAndUsage(
    request: GetCostAndUsageRequest,
  ): Promise<GetCostAndUsageResponse> {
    return this.makeRequest("AWSInsightsIndexService.GetCostAndUsage", request);
  }

  getCostForecast(
    request: GetCostForecastRequest,
  ): Promise<GetCostForecastResponse> {
    return this.makeRequest("AWSInsightsIndexService.GetCostForecast", request);
  }

  getDimensionValues(
    request: GetDimensionValuesRequest,
  ): Promise<GetDimensionValuesResponse> {
    return this.makeRequest(
      "AWSInsightsIndexService.GetDimensionValues",
      request,
    );
  }

  getAnomalies(
    request: GetAnomaliesRequest,
  ): Promise<GetAnomaliesResponse> {
    return this.makeRequest("AWSInsightsIndexService.GetAnomalies", request);
  }

  getUsageForecast(request: {
    TimePeriod: DateInterval;
    Metric: "UsageQuantity" | "NormalizedUsageAmount";
    Granularity: "DAILY" | "MONTHLY";
    Filter?: Expression;
    PredictionIntervalLevel?: number;
  }): Promise<GetCostForecastResponse> {
    return this.makeRequest(
      "AWSInsightsIndexService.GetUsageForecast",
      request,
    );
  }

  getReservationCoverage(request: {
    TimePeriod: DateInterval;
    GroupBy?: GroupDefinition[];
    Granularity?: "DAILY" | "MONTHLY";
    Filter?: Expression;
    Metrics?: string[];
    NextPageToken?: string;
    SortBy?: {
      Key: string;
      SortOrder: "ASCENDING" | "DESCENDING";
    };
    MaxResults?: number;
  }): Promise<{
    CoveragesByTime: Array<{
      TimePeriod: DateInterval;
      Groups?: Array<{
        Attributes: Record<string, string>;
        Coverage: {
          CoverageHours: {
            OnDemandHours: string;
            ReservedHours: string;
            TotalRunningHours: string;
            CoverageHoursPercentage: string;
          };
          CoverageNormalizedUnits: {
            OnDemandNormalizedUnits: string;
            ReservedNormalizedUnits: string;
            TotalRunningNormalizedUnits: string;
            CoverageNormalizedUnitsPercentage: string;
          };
          CoverageCost: {
            OnDemandCost: string;
          };
        };
      }>;
      Total?: {
        CoverageHours: {
          OnDemandHours: string;
          ReservedHours: string;
          TotalRunningHours: string;
          CoverageHoursPercentage: string;
        };
        CoverageNormalizedUnits: {
          OnDemandNormalizedUnits: string;
          ReservedNormalizedUnits: string;
          TotalRunningNormalizedUnits: string;
          CoverageNormalizedUnitsPercentage: string;
        };
        CoverageCost: {
          OnDemandCost: string;
        };
      };
    }>;
    NextPageToken?: string;
  }> {
    return this.makeRequest(
      "AWSInsightsIndexService.GetReservationCoverage",
      request,
    );
  }

  getSavingsPlansUtilization(request: {
    TimePeriod: DateInterval;
    Granularity?: "DAILY" | "MONTHLY";
    Filter?: Expression;
    SortBy?: {
      Key: string;
      SortOrder: "ASCENDING" | "DESCENDING";
    };
    NextToken?: string;
    MaxResults?: number;
  }): Promise<{
    SavingsPlansUtilizationsByTime: Array<{
      TimePeriod: DateInterval;
      Utilization: {
        TotalCommitment: string;
        UsedCommitment: string;
        UnusedCommitment: string;
        UtilizationPercentage: string;
      };
      Savings: {
        NetSavings: string;
        OnDemandCostEquivalent: string;
      };
      AmortizedCommitment: {
        AmortizedRecurringCommitment: string;
        AmortizedUpfrontCommitment: string;
        TotalAmortizedCommitment: string;
      };
    }>;
    Total: {
      Utilization: {
        TotalCommitment: string;
        UsedCommitment: string;
        UnusedCommitment: string;
        UtilizationPercentage: string;
      };
      Savings: {
        NetSavings: string;
        OnDemandCostEquivalent: string;
      };
      AmortizedCommitment: {
        AmortizedRecurringCommitment: string;
        AmortizedUpfrontCommitment: string;
        TotalAmortizedCommitment: string;
      };
    };
    NextToken?: string;
  }> {
    return this.makeRequest(
      "AWSInsightsIndexService.GetSavingsPlansUtilization",
      request,
    );
  }
}

export class AWSBudgetsClient {
  private credentials: AWSCredentials;
  private baseUrl: string;

  constructor(credentials: AWSCredentials) {
    this.credentials = credentials;
    this.baseUrl = `https://budgets.us-east-1.amazonaws.com`;
  }

  private signRequest(
    method: string,
    path: string,
    body: string,
    headers: Record<string, string>,
  ): Record<string, string> {
    const now = new Date();
    const isoDateTime = now.toISOString().replace(/[:\-]|\.\d{3}/g, "");
    const isoDate = isoDateTime.substr(0, 8);

    // AWS Budgets is only available in us-east-1
    const region = "us-east-1";
    const service = "budgets";

    // Create canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map((key) => `${key.toLowerCase()}:${headers[key]}`)
      .join("\n");

    const signedHeaders = Object.keys(headers)
      .sort()
      .map((key) => key.toLowerCase())
      .join(";");

    const bodyHash = createHash("sha256").update(body).digest("hex");

    const canonicalRequest = [
      method,
      path,
      "", // query string
      canonicalHeaders,
      "",
      signedHeaders,
      bodyHash,
    ].join("\n");

    // Create string to sign
    const credentialScope = `${isoDate}/${region}/${service}/aws4_request`;
    const algorithm = "AWS4-HMAC-SHA256";
    const canonicalRequestHash = createHash("sha256").update(canonicalRequest)
      .digest("hex");

    const stringToSign = [
      algorithm,
      isoDateTime,
      credentialScope,
      canonicalRequestHash,
    ].join("\n");

    // Calculate signature
    const kDate = createHmac(
      "sha256",
      `AWS4${this.credentials.secretAccessKey}`,
    ).update(isoDate).digest();
    const kRegion = createHmac("sha256", kDate).update(region).digest();
    const kService = createHmac("sha256", kRegion).update(service).digest();
    const kSigning = createHmac("sha256", kService).update("aws4_request")
      .digest();
    const signature = createHmac("sha256", kSigning).update(stringToSign)
      .digest("hex");

    const authorizationHeader =
      `${algorithm} Credential=${this.credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      ...headers,
      "Authorization": authorizationHeader,
      "X-Amz-Date": isoDateTime,
      ...(this.credentials.sessionToken &&
        { "X-Amz-Security-Token": this.credentials.sessionToken }),
    };
  }

  // deno-lint-ignore no-explicit-any
  private async makeRequest<T>(target: string, body: any): Promise<T> {
    const requestBody = JSON.stringify(body);
    const headers = {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": target,
      "Host": new URL(this.baseUrl).host,
      "User-Agent": "deco-aws-app/1.0",
      "Accept": "application/json",
      "Content-Length": requestBody.length.toString(),
    };

    const signedHeaders = await this.signRequest(
      "POST",
      "/",
      requestBody,
      headers,
    );

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: signedHeaders,
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AWS API Error (${response.status}): ${errorText}`);
    }

    // Check if response has content
    const responseText = await response.text();

    if (!responseText) {
      throw new Error("AWS API returned empty response");
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error
        ? parseError.message
        : "Unknown JSON parse error";
      throw new Error(
        `Failed to parse AWS API response as JSON: ${errorMessage}`,
      );
    }
  }

  getBudgets(request: GetBudgetsRequest): Promise<GetBudgetsResponse> {
    return this.makeRequest("AWSBudgetServiceGateway.DescribeBudgets", request);
  }

  getBudget(
    accountId: string,
    budgetName: string,
  ): Promise<{ Budget: Budget }> {
    return this.makeRequest("AWSBudgetServiceGateway.DescribeBudget", {
      AccountId: accountId,
      BudgetName: budgetName,
    });
  }

  createBudget(
    accountId: string,
    budget: Omit<Budget, "CalculatedSpend" | "LastUpdatedTime">,
  ): Promise<void> {
    return this.makeRequest("AWSBudgetServiceGateway.CreateBudget", {
      AccountId: accountId,
      Budget: budget,
    });
  }

  updateBudget(accountId: string, budget: Budget): Promise<void> {
    return this.makeRequest("AWSBudgetServiceGateway.ModifyBudget", {
      AccountId: accountId,
      NewBudget: budget,
    });
  }

  deleteBudget(accountId: string, budgetName: string): Promise<void> {
    return this.makeRequest("AWSBudgetServiceGateway.DeleteBudget", {
      AccountId: accountId,
      BudgetName: budgetName,
    });
  }
}

// Utility functions for common operations
export class AWSCostUtils {
  static formatCurrency(amount: string, unit: string = "USD"): string {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: unit,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  static getDateRange(days: number): DateInterval {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    return {
      Start: start.toISOString().split("T")[0],
      End: end.toISOString().split("T")[0],
    };
  }

  static getMonthlyDateRange(months: number): DateInterval {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    start.setDate(1); // Start of month

    return {
      Start: start.toISOString().split("T")[0],
      End: end.toISOString().split("T")[0],
    };
  }

  static getCurrentMonth(): DateInterval {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      Start: start.toISOString().split("T")[0],
      End: end.toISOString().split("T")[0],
    };
  }

  static getLastMonth(): DateInterval {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      Start: start.toISOString().split("T")[0],
      End: end.toISOString().split("T")[0],
    };
  }

  static calculateCostDifference(current: string, previous: string): {
    difference: number;
    percentage: number;
    isIncrease: boolean;
  } {
    const currentAmount = parseFloat(current);
    const previousAmount = parseFloat(previous);
    const difference = currentAmount - previousAmount;
    const percentage = previousAmount !== 0
      ? (difference / previousAmount) * 100
      : 0;

    return {
      difference: Math.abs(difference),
      percentage: Math.abs(percentage),
      isIncrease: difference > 0,
    };
  }

  static groupByService(
    results: GetCostAndUsageResponse,
  ): Record<string, number> {
    const serviceMap: Record<string, number> = {};

    for (const result of results.ResultsByTime) {
      if (result.Groups) {
        for (const group of result.Groups) {
          const serviceName = group.Keys[0] || "Unknown";
          const cost = parseFloat(group.Metrics.BlendedCost?.Amount || "0");
          serviceMap[serviceName] = (serviceMap[serviceName] || 0) + cost;
        }
      }
    }

    return serviceMap;
  }

  static getTopServices(
    serviceMap: Record<string, number>,
    limit: number = 10,
  ): Array<{ service: string; cost: number }> {
    return Object.entries(serviceMap)
      .map(([service, cost]) => ({ service, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, limit);
  }
}
