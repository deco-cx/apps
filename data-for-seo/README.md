# DataForSEO App

This app provides integration with the DataForSEO API for comprehensive SEO data analysis.

## Features

- Keyword research with search volume and competition data
- SERP analysis (organic and paid results)
- Backlink analysis and domain metrics
- Traffic analytics and sources breakdown
- Advanced keyword difficulty analysis
- Domain comparison tools

## Configuration

To use this app, you need a DataForSEO account:

1. Sign up for a DataForSEO account at https://dataforseo.com
2. Get your login (email) and password from your account
3. Add the credentials when installing the app in Deco

The app uses Basic Authentication - your credentials are encoded and sent with each API request.

## Available Loaders

### Keywords Data
- `getSearchVolume` - Get search volume, CPC, and competition data for keywords
- `getRelatedKeywords` - Get keyword suggestions related to seed keywords
- `getAdsCompetition` - Get Google Ads competition data including CPC and bid estimates

### SERP Analysis
- `getOrganicResults` - Get organic search results from Google SERP
- `getAdResults` - Get paid ads results from Google SERP
- `getMapsResults` - Get Google Maps/Local Pack results

### Backlink Analysis
- `getBacklinksOverview` - Get an overview of backlinks data for a domain
- `getBacklinks` - Get a detailed list of backlinks for a domain or URL
- `getAnchors` - Get anchor text distribution analysis
- `getReferringDomains` - Get list of domains linking to target

### Traffic Analytics
- `getTrafficOverview` - Get website traffic overview metrics
- `getTrafficBySources` - Get traffic breakdown by source (direct, organic, paid, referral, social)
- `getTrafficByCountry` - Get traffic distribution by country
- `getTrafficByPages` - Get traffic metrics for individual pages

## Available Actions

### Analysis Tools
- `analyzeKeywordDifficulty` - Analyze keyword difficulty based on competition and SERP analysis
- `compareDomainMetrics` - Compare traffic and backlink metrics between multiple domains
- `generateSEOAudit` - Comprehensive SEO audit with traffic, backlinks, and keyword analysis
- `analyzeLocalSEO` - Local SEO analysis for businesses with local presence
- `trackSERPFeatures` - Monitor and analyze SERP features for target keywords

## API Behavior

DataForSEO API works in two modes:

1. **Task-based endpoints** (Keywords, SERP): 
   - You post a task and receive a task ID
   - The loader automatically polls for results
   - May take 10-60 seconds to complete

2. **Live endpoints** (Backlinks, Traffic):
   - Return results immediately
   - No polling required

## Usage Examples

```typescript
// Get keyword search volume
const volumeData = await ctx.invoke.dataforseo.loaders.keywords.getSearchVolume({
  keywords: ["seo tools", "keyword research"],
  language_name: "English",
  location_name: "United States"
});

// Analyze keyword difficulty
const difficulty = await ctx.invoke.dataforseo.actions.analyzeKeywordDifficulty({
  keywords: ["digital marketing", "seo services"],
  language_name: "English",
  location_name: "United States"
});

// Compare domains
const comparison = await ctx.invoke.dataforseo.actions.compareDomainMetrics({
  domains: ["example.com", "competitor1.com", "competitor2.com"]
});

// Get backlinks overview
const backlinks = await ctx.invoke.dataforseo.loaders.backlinks.getBacklinksOverview({
  target: "example.com"
});
```

## Rate Limits

DataForSEO has rate limits based on your subscription plan. The loaders handle API responses but be aware of:
- Concurrent request limits
- Daily/monthly request quotas
- Cost per API call (varies by endpoint)

Check your DataForSEO dashboard for current usage and limits.
