# Exa AI Integration for deco.cx

This app integrates [Exa AI](https://exa.ai) with deco.cx, allowing you to search the web and retrieve content using Exa's powerful AI-driven search capabilities.

## Features

- **Web Search**: Search the web with Exa's AI-powered search
- **LinkedIn Company Search**: Specifically search for companies on LinkedIn
- **Company Research**: Crawl company websites to gather comprehensive information
- **Document Crawling**: Retrieve specific documents by ID with precise control

## Setup

1. Get an API key from [Exa AI](https://exa.ai)
2. Install the app in your deco.cx project
3. Configure the app with your API key

## Loaders

### Search

The main search loader allows you to search the web using Exa's AI:

```tsx
import { useLoader } from "@deco/deco";
import type { ExaSearchResponse } from "exa/client.ts";
import SearchLoader from "exa/loaders/search.ts";

const { data } = useLoader<ExaSearchResponse>(SearchLoader, {
  query: "deco.cx headless commerce",
  numResults: 5,
});
```

### LinkedIn Search

The LinkedIn-specific search loader is optimized for finding company information on LinkedIn:

```tsx
import { useLoader } from "@deco/deco";
import type { ExaSearchResponse } from "exa/client.ts";
import LinkedInSearchLoader from "exa/loaders/linkedinSearch.ts";

const { data } = useLoader<ExaSearchResponse>(LinkedInSearchLoader, {
  query: "acme company page",
  numResults: 3,
});
```

### Company Research

The company research loader crawls company websites to gather comprehensive information:

```tsx
import { useLoader } from "@deco/deco";
import type { ExaSearchResponse } from "exa/client.ts";
import CompanyResearchLoader from "exa/loaders/companyResearch.ts";

const { data } = useLoader<ExaSearchResponse>(CompanyResearchLoader, {
  query: "https://exa.ai",
  subpages: 10,
  subpageTarget: ["about", "pricing", "faq", "blog"],
});
```

## Actions

### Crawl

The crawl action allows you to retrieve specific documents by their IDs:

```tsx
import { useAction } from "@deco/deco";
import CrawlAction from "exa/actions/crawl.ts";

const { execute } = useAction(CrawlAction);

const handleCrawl = async () => {
  const result = await execute({
    ids: ["doc_123", "doc_456"],
    text: true,
    livecrawl: "always",
  });
  
  console.log(result);
};
```

## API Reference

Refer to the [Exa AI API documentation](https://exa.ai/docs) for more details about the underlying API. 