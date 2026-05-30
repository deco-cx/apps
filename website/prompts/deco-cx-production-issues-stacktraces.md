# Deco.cx Production Issues & Stack Traces

**Version:** 1.0  
**Date:** September 2025  
**Target Audience:** AI Coding Agents & Developers  
**Parent Guide:** [deco-cx-store-migration-plan.md](./deco-cx-store-migration-plan.md)

This document contains real stack traces and solutions from production deco.cx stores, providing concrete examples of common issues and their fixes.

## 🔥 Critical Production Issues

### 1. Data URI Injection in Search Parameters

**Environment:** Production e-commerce store  
**Frequency:** Very High (multiple times per day)  
**Impact:** 500 errors, broken search functionality, potential security risk

#### Stack Trace:
```
rendering: site/sections/Product/SearchResult.tsx TypeError: error sending request for url (https://secure.example-store.com/api/catalog_system/pub/portal/pagetype/product-sku-123456/data:text/javascript;base64,[base64-encoded-content]...)
?term=product-sku-123456%2Fdata%3Atext%2Fjavascript%3Bbase64%2C...

at async mainFetch (ext:deno_fetch/26_fetch.js:170:12)
at async fetch (ext:deno_fetch/26_fetch.js:391:7)
at async pageTypesFromUrl (vtex/utils/intelligentSearch.ts:166:10)
at async loader (vtex/loaders/intelligentSearch/productListingPage.ts:288:24)
```

#### Root Cause:
The VTEX search API is receiving product slugs with embedded `data:text/javascript` URIs appended by the Deco live inspector script. This happens when the Deco admin environment injects client-side scripts that get accidentally included in search parameters.

#### Solution Implemented:
```typescript
// components/search/InfiniteScroll.tsx & SearchResult.tsx
const sanitizeSegment = (segment: string) => {
    const s = segment.trim()
    if (!s) return ''
    const lower = s.toLowerCase()
    // Block data URIs and javascript URLs
    if (lower.includes('data:') || lower.includes('javascript:')) return ''
    if (lower.includes('data%3a') || lower.includes('javascript%3a')) return ''
    if (s.length > 200) return ''
    return s
}

// Apply sanitization to URL path segments
const sanitizedSegments = currentUrl.pathname
    .split('/')
    .map(sanitizeSegment)
    .filter((item) => item !== '')

const selectedCategory = sanitizedSegments.map((item, index) => {
    return {
        key: `category-${index + 1}`,
        value: item,
    }
})
```

### 2. Image Component Crash - Undefined Source

**Environment:** Production e-commerce store  
**Frequency:** High (several times per hour)  
**Impact:** Banner sections not rendering, layout breaks

#### Stack Trace:
```
rendering: site/sections/Images/BannerWithTitle.tsx 
TypeError: Cannot read properties of undefined (reading 'startsWith') 
  at getOptimizedMediaUrl (apps/website/components/Image.tsx:89:19) 
  at getSrcSet (apps/website/components/Image.tsx:144:17) 
  at Picture.tsx:34:20 
  at renderToString (preact-render-to-string/6.4.2/dist/index.mjs:1:5462)
```

#### Root Cause:
The `BannerWithTitle` component receives undefined `src` values for mobile or desktop images, which gets passed to the `Picture` component without validation.

#### Solution Implemented:
```typescript
// components/ui/BannerWithTitle.tsx
export default function BannerWithTitle({ 
  mobile, 
  desktop, 
  title 
}: Props) {
  // Guard against undefined image sources
  const mobileSrc = mobile?.src
  const desktopSrc = desktop?.src
  
  // Don't render if no images available
  if (!mobileSrc && !desktopSrc) {
    return null
  }
  
  return (
    <Picture preload>
      {mobileSrc && (
        <Source 
          media="(max-width: 767px)" 
          src={mobileSrc}
          width={mobile.width || 375}
          height={mobile.height || 200}
        />
      )}
      {desktopSrc && (
        <Source 
          media="(min-width: 768px)" 
          src={desktopSrc}
          width={desktop.width || 1200} 
          height={desktop.height || 400}
        />
      )}
      <img
        class="object-cover w-full h-full"
        loading="lazy"
        src={desktopSrc || mobileSrc}
        alt={title || "Banner"}
        width={desktopSrc ? desktop?.width || 1200 : mobile?.width || 375}
        height={desktopSrc ? desktop?.height || 400 : mobile?.height || 200}
      />
    </Picture>
  )
}
```

### 3. VTEX Search API 500 Errors

**Environment:** Production e-commerce store  
**Frequency:** Medium (multiple times per day)  
**Impact:** Empty search results, broken category pages

#### Stack Trace:
```
rendering: site/sections/Product/SearchResult.tsx 
HttpError 500: {"status":500,"code":"RESOLVER_WARNING","name":"ResolverWarning","level":"warn","response":{"data":"","headers":{"content-length":"0","connection":"close","x-vtex-backend-status-code":"InternalServerError"},"status":500},"message":"Request failed with status code 500"} 

at fetchSafe (apps/utils/fetch.ts:50:9) 
at async loader (vtex/loaders/intelligentSearch/productListingPage.ts:309:42) 
at async callHandlerAndCache (blocks/loader.ts:304:24)
```

#### Root Cause:
VTEX Intelligent Search API occasionally returns 500 errors for certain search parameters, facet combinations, or when the backend is under load.

#### Solution Implemented:
```typescript
// Enhanced error handling in SearchResult.tsx and InfiniteScroll.tsx
try {
    const page = await invoke.vtex.loaders.intelligentSearch.productListingPage({
        selectedFacets: newSelectedFacets,
        sort: sort as SortType,
        count: pageInfo.recordPerPage,
        query,
        page: pageInfo.currentPage - offset,
        fuzzy: fuzzy ?? 'disabled',
        hideUnavailableItems: true,
    })
    nextPage.value = page
} catch (error) {
    const facetsStr = (newSelectedFacets ?? [])
        .map((f) => `${f.key}:${f.value}`)
        .join('|')
    
    nextPage.value = null
    
    // Create structured error for HyperDX monitoring
    const err = new Error(
        `InfiniteScroll: failed to fetch next page err=${
            (error as Error)?.message ?? 'unknown'
        } facets=${facetsStr} sort=${sort ?? ''} count=${pageInfo.recordPerPage} query=${
            query ?? ''
        } page=${pageInfo.currentPage - offset} fuzzy=${
            fuzzy ?? 'disabled'
        } hideUnavailableItems=true`,
    )
    
    // Re-throw so framework error boundary captures it
    throw err
}
```

## 🛠️ Image Optimization Issues

### 1. Missing Height Warnings

**Issue:** Brand carousel images generating "Missing height. This image will NOT be optimized" warnings

#### Before (Problematic):
```typescript
// components/ui/InfiniteSlider.tsx - WRONG
{brands?.map((brand, index) => (
    <div key={index} class="min-w-[120px]">
        <img
            src={brand.src}
            alt={brand.alt}
            // ❌ Missing explicit dimensions
            class="object-contain"
            loading="lazy"
        />
    </div>
))}
```

#### After (Fixed):
```typescript
// components/ui/InfiniteSlider.tsx - CORRECT
{brands?.map((brand, index) => (
    <div key={index} class="min-w-[120px]">
        <img
            src={brand.src}
            alt={brand.alt}
            width={120}  // ✅ Explicit dimensions prevent warnings
            height={120}
            class="object-contain"
            loading="lazy"
        />
    </div>
))}
```

### 2. YourViews Component Array Handling

**Issue:** Undefined image arrays causing crashes in review components

#### Stack Trace:
```
TypeError: Cannot read properties of undefined (reading '0')
  at QuestionsAnswers (sections/Yourviews/Inputs.tsx:21:12)
```

#### Solution:
```typescript
// sections/Yourviews/Inputs.tsx
function QuestionsAnswers({ page }: Props) {
    const { images = [], additionalProperty = [] } = page.product
    
    // Safe array access
    const image = Array.isArray(images) ? images[0] : undefined
    
    return (
        <>
            <input id='yv-productImage' type='hidden' value={image?.url ?? ''} />
            {/* Rest of component */}
        </>
    )
}
```

## 🚀 Performance Optimization Issues

### 1. Duplicate Loader Problem

**Issue:** Category pages making redundant API calls

#### Problem:
```json
// .deco/blocks/pages-category-7493d4326022.json - BEFORE
{
  "sections": [
    {
      "__resolveType": "site/sections/Content/BreadcrumbsSection.tsx",
      "productListingPage": "Lista de Produtos - 20 Itens"  // ❌ Duplicate fetch
    },
    {
      "__resolveType": "site/sections/Product/SearchResult.tsx", 
      "page": "Lista de Produtos - 20 Itens"  // ❌ Same data fetched again
    }
  ]
}
```

#### Solution:
```json
// .deco/blocks/pages-category-7493d4326022.json - AFTER
{
  "sections": [
    {
      "__resolveType": "site/sections/Content/BreadcrumbsSection.tsx"
      // ✅ Removed duplicate loader reference
    },
    {
      "__resolveType": "site/sections/Product/SearchResult.tsx",
      "page": "Lista de Produtos - 20 Itens"  // ✅ Single source of truth
    }
  ]
}
```

### 2. SWR Caching Implementation

**Issue:** Heavy SEO middleware not cached, causing performance issues

#### Solution:
```typescript
// sections/SEO/SeoPLPV2Middleware.tsx
export const cache = 'stale-while-revalidate'  // ✅ Enable SWR caching

export default function SeoPLPV2Middleware(props: Props) {
    // Heavy SEO computation here...
    return <SEOComponent {...seoData} />
}
```

## 🔧 Build System Issues

### 1. PostCSS Peer Dependency Warnings

**Issue:**
```
npm WARN cssnano@6.1.2 requires a peer of postcss@^8.4.31 but postcss@8.4.27 was installed
```

#### Solution:
```json
// deno.json
{
  "imports": {
    "postcss": "npm:postcss@8.4.38",
    "postcss@8.4.27": "npm:postcss@8.4.38"  // ✅ Alias mapping
  }
}
```

### 2. Loading State Management

**Issue:** UI elements getting stuck in loading state when errors occur

#### Problem:
```typescript
// WRONG - Loading state not cleaned up on error
onClick={async (event) => {
    const target = event.currentTarget as HTMLElement
    target.setAttribute('data-loading', '')
    
    await fetchNextPage()  // ❌ If this throws, loading state persists
    
    target.removeAttribute('data-loading')
}}
```

#### Solution:
```typescript
// CORRECT - Always clean up loading state
onClick={async (event) => {
    const target = event.currentTarget as HTMLElement
    target.setAttribute('data-loading', '')
    
    try {
        await fetchNextPage()
        // Success-only code here
        if (typeof konfidencyLoader !== 'undefined') {
            konfidencyLoader.loadShowcase()
        }
    } finally {
        // ✅ Always executed, even on error
        target.removeAttribute('data-loading')
    }
}}
```

## 🔍 Debugging Patterns

### 1. Structured Error Context

**Pattern:** Always include relevant context in error messages for debugging

```typescript
// Template for API error handling
try {
    const result = await apiCall(params)
    return result
} catch (error) {
    // Build context string with all relevant parameters
    const contextStr = Object.entries(params)
        .map(([key, value]) => `${key}=${value ?? ''}`)
        .join(' ')
    
    throw new Error(
        `ComponentName: failed to ${operation} err=${
            (error as Error)?.message ?? 'unknown'
        } ${contextStr}`,
    )
}
```

### 2. Safe Property Access

**Pattern:** Always guard against undefined properties in components

```typescript
// Template for safe component props
interface ComponentProps {
    data?: {
        items?: Array<unknown>
        config?: Record<string, unknown>
    }
}

export default function Component({ data }: ComponentProps) {
    // ✅ Safe access with defaults
    const items = data?.items ?? []
    const config = data?.config ?? {}
    
    // ✅ Early return for missing required data
    if (!data || items.length === 0) {
        return <div>No data available</div>
    }
    
    return (
        <div>
            {items.map((item, index) => (
                <div key={index}>{/* Render item */}</div>
            ))}
        </div>
    )
}
```

## 📋 Production Issue Checklist

When debugging production issues:

- [ ] **Check error context** - Look for structured error messages with parameters
- [ ] **Verify input sanitization** - Ensure search parameters don't contain data URIs
- [ ] **Validate image sources** - Check that all image components have proper src validation
- [ ] **Confirm loading states** - Verify UI loading states are cleaned up in finally blocks
- [ ] **Review API error handling** - Ensure external API failures don't crash the page
- [ ] **Check duplicate loaders** - Look for redundant data fetching in page configs
- [ ] **Validate caching** - Ensure heavy components use appropriate cache strategies

---

**Related Documents:**
- [deco-cx-store-migration-plan.md](./deco-cx-store-migration-plan.md) - Main migration guide
- [deco-cx-error-handling-patterns.md](./deco-cx-error-handling-patterns.md) - Error handling patterns

**Last Updated:** September 2025