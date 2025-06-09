# AWS Cost Explorer & Billing App

A comprehensive AWS integration app for cost analysis, budget monitoring, and billing insights using the AWS Cost Explorer API.

## Features

### 📊 Cost Analysis
- **Cost and Usage Reports**: Detailed cost breakdowns with customizable time periods and grouping
- **Cost Forecasting**: Predict future costs with confidence intervals and trend analysis
- **Service Cost Analysis**: Deep dive into service-specific costs with trend comparisons
- **Multi-dimensional Breakdowns**: Analyze costs by service, region, account, usage type, and more

### 💰 Budget Management
- **Budget Monitoring**: Track budget performance with utilization percentages and alerts
- **Budget Creation**: Create new budgets with filters and customizable parameters
- **Budget Updates**: Modify existing budgets with change tracking
- **Budget Deletion**: Safe budget removal with confirmation

### 🚨 Anomaly Detection
- **Cost Anomalies**: Identify unusual spending patterns with severity classification
- **Root Cause Analysis**: Detailed breakdown of anomaly causes by service and region
- **Risk Assessment**: Automated risk level calculation and actionable insights
- **Trend Monitoring**: Track anomaly patterns over time

### 💾 Data Export
- **Multiple Formats**: Export cost data in JSON or CSV formats
- **Custom Grouping**: Export with various grouping dimensions
- **Summary Statistics**: Include summary metrics in exports
- **Bulk Data Processing**: Handle large datasets efficiently

### 🔍 Reserved Instances & Savings Plans
- **RI Coverage Analysis**: Monitor reserved instance coverage and utilization
- **Savings Plans Tracking**: Track savings plans utilization and net savings
- **Cost Optimization**: Identify opportunities for reserved instance purchases

## Setup

### Prerequisites
- AWS Account with appropriate permissions
- AWS Access Key ID and Secret Access Key
- Cost Explorer enabled in your AWS account

### Required AWS Permissions

Create an IAM policy with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "ce:GetUsageForecast",
        "ce:GetAnomalies",
        "ce:GetDimensionValues",
        "ce:GetReservationCoverage",
        "ce:GetSavingsPlansUtilization",
        "budgets:DescribeBudgets",
        "budgets:DescribeBudget",
        "budgets:CreateBudget",
        "budgets:ModifyBudget",
        "budgets:DeleteBudget"
      ],
      "Resource": "*"
    }
  ]
}
```

### Configuration

Add the AWS app to your deco configuration with the following parameters:

```typescript
{
  accessKeyId: "your-aws-access-key-id", // Required - string
  secretAccessKey: "your-aws-secret-access-key", // Required - string
  region: "us-east-1", // Optional, defaults to us-east-1
  sessionToken: "your-session-token", // Optional - for temporary credentials
  accountId: "your-aws-account-id", // Required for budget operations
  defaultCurrency: "USD", // Optional, defaults to USD
  enableAnomalyDetection: true, // Optional, defaults to true
  enableBudgetMonitoring: true // Optional, defaults to true
}
```

**Important Notes:**
- **Billing Services Region**: AWS Cost Explorer and Budgets APIs are only available in `us-east-1`. The app automatically uses this region for all billing operations, regardless of your configured region setting.
- **Security**: Store your AWS credentials securely. In production environments, consider using environment variables or AWS IAM roles for enhanced security.
- **Region Setting**: The `region` parameter is available for future extensibility but currently doesn't affect billing operations since they're centralized in `us-east-1`.

## Loaders

### Cost and Usage (`costAndUsage.ts`)
Retrieve detailed cost and usage data with customizable grouping and filtering.

**Parameters:**
- `timePeriodDays`: Number of days to analyze (default: 30)
- `granularity`: DAILY, MONTHLY, or HOURLY
- `groupBy`: Dimension to group by (SERVICE, REGION, etc.)
- `metrics`: Cost metrics to retrieve
- `serviceFilter`: Filter by specific AWS service

**Example Response:**
```json
{
  "costData": [
    {
      "timePeriod": {"Start": "2024-01-01", "End": "2024-01-02"},
      "total": {"amount": "125.50", "formatted": "$125.50"},
      "groups": [
        {
          "keys": ["Amazon Elastic Compute Cloud - Compute"],
          "metrics": {"BlendedCost": {"amount": "75.30", "formatted": "$75.30"}}
        }
      ]
    }
  ],
  "summary": {
    "totalCost": {"amount": "3765.00", "formatted": "$3,765.00"},
    "topServices": [
      {"service": "EC2", "cost": 1250.30, "percentage": 33.2}
    ]
  }
}
```

### Cost Forecast (`costForecast.ts`)
Generate cost forecasts with confidence intervals and trend analysis.

**Parameters:**
- `forecastDays`: Number of days to forecast (default: 30)
- `metric`: Cost metric to forecast
- `predictionIntervalLevel`: Confidence level (default: 80)
- `includeHistoricalComparison`: Include historical data for trend analysis

### Budget Monitoring (`budgets.ts`)
Monitor budget performance and utilization.

**Parameters:**
- `budgetName`: Specific budget to analyze (optional)
- `maxResults`: Maximum number of budgets to return

**Example Response:**
```json
{
  "budgets": [
    {
      "budgetName": "Monthly Cost Budget",
      "utilizationPercentage": 75.5,
      "status": "ON_TRACK",
      "remainingBudget": {"amount": "245.50", "formatted": "$245.50"}
    }
  ],
  "alerts": [
    {
      "budgetName": "Production Budget",
      "alertType": "HIGH_UTILIZATION",
      "severity": "MEDIUM"
    }
  ]
}
```

### Anomaly Detection (`anomalies.ts`)
Detect and analyze cost anomalies with severity classification.

**Parameters:**
- `timePeriodDays`: Analysis period (default: 30)
- `minImpactAmount`: Minimum impact threshold (default: $10)
- `maxResults`: Maximum anomalies to return

### Service Analysis (`services.ts`)
Detailed service-level cost analysis with trend comparisons.

**Parameters:**
- `topServicesLimit`: Number of top services to analyze (default: 10)
- `compareWithPreviousPeriod`: Include period-over-period comparison
- `includeCostTrends`: Include trend analysis

### Cost Breakdown (`costBreakdown.ts`)
Multi-dimensional cost analysis across various AWS dimensions.

**Parameters:**
- `primaryDimension`: Primary grouping dimension
- `secondaryDimension`: Secondary grouping (optional)
- `includeRegionalBreakdown`: Include regional analysis
- `includeUsageTypeAnalysis`: Include usage type breakdown

## Actions

### Create Budget (`createBudget.ts`)
Create new AWS budgets with customizable parameters.

**Parameters:**
- `budgetName`: Name for the new budget (required)
- `budgetAmount`: Budget limit amount (required)
- `budgetType`: COST, USAGE, RI_UTILIZATION, etc.
- `timeUnit`: DAILY, MONTHLY, QUARTERLY, ANNUALLY
- `serviceFilter`: Filter by specific service (optional)

### Update Budget (`updateBudget.ts`)
Modify existing budgets with change tracking.

**Parameters:**
- `budgetName`: Budget to update (required)
- `budgetAmount`: New budget amount (optional)
- `currency`: New currency (optional)
- `startDate`/`endDate`: New time period (optional)

### Delete Budget (`deleteBudget.ts`)
Safely delete budgets with confirmation.

**Parameters:**
- `budgetName`: Budget to delete (required)
- `confirmDeletion`: Safety confirmation (required)

### Export Cost Data (`exportCostData.ts`)
Export cost data in JSON or CSV format.

**Parameters:**
- `format`: JSON or CSV
- `groupBy`: Grouping dimension
- `includeSummary`: Include summary statistics
- `timePeriodDays`: Data period to export

## Usage Examples

### Basic Cost Analysis
```typescript
// Get last 30 days of cost data grouped by service
const costData = await invoke.aws.loaders.costAndUsage({
  timePeriodDays: 30,
  groupBy: "SERVICE",
  granularity: "DAILY"
});
```

### Budget Monitoring Dashboard
```typescript
// Get all budgets with performance metrics
const budgets = await invoke.aws.loaders.budgets({
  includeBudgetPerformance: true
});

// Check for budget alerts
const alerts = budgets.alerts.filter(alert => 
  alert.severity === "HIGH" || alert.severity === "CRITICAL"
);
```

### Cost Optimization Analysis
```typescript
// Analyze service costs with trends
const services = await invoke.aws.loaders.services({
  topServicesLimit: 15,
  compareWithPreviousPeriod: true,
  includeCostTrends: true
});

// Get cost breakdown by multiple dimensions
const breakdown = await invoke.aws.loaders.costBreakdown({
  primaryDimension: "SERVICE",
  secondaryDimension: "REGION",
  includeRegionalBreakdown: true
});
```

### Anomaly Detection
```typescript
// Monitor for cost anomalies
const anomalies = await invoke.aws.loaders.anomalies({
  timePeriodDays: 30,
  minImpactAmount: 50,
  includeRootCauseAnalysis: true
});

// Filter critical anomalies
const criticalAnomalies = anomalies.anomalies.filter(
  anomaly => anomaly.score.severity === "CRITICAL"
);
```

### Data Export
```typescript
// Export cost data for external analysis
const exportResult = await invoke.aws.actions.exportCostData({
  format: "CSV",
  timePeriodDays: 90,
  groupBy: "SERVICE",
  includeSummary: true
});

// The exported data is available in exportResult.exportData.content
```

## Error Handling

The app includes comprehensive error handling for common scenarios:

- **Invalid Credentials**: Clear error messages for authentication issues
- **Missing Permissions**: Specific guidance on required AWS permissions
- **API Limits**: Graceful handling of AWS API rate limits
- **Data Validation**: Input validation with helpful error messages

## Cost Optimization Tips

The app provides automated insights and recommendations:

1. **Service Concentration**: Alerts when a single service dominates costs
2. **Regional Distribution**: Recommendations for multi-region strategies
3. **Reserved Instances**: Suggestions for RI purchases based on usage patterns
4. **Anomaly Response**: Actionable steps for cost anomaly resolution
5. **Budget Optimization**: Dynamic budget adjustment recommendations

## Support

For issues or feature requests:
1. Check the error messages for specific guidance
2. Verify AWS permissions and credentials
3. Ensure Cost Explorer is enabled in your AWS account
4. Review the AWS Cost Explorer API documentation for additional context

## Security

- Credentials are handled securely using the app's Secret type
- All API calls use AWS Signature Version 4 for authentication
- No sensitive data is logged or exposed in error messages
- Budget operations require explicit confirmation for safety 