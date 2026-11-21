# Deco.cx Error Handling & Security Patterns

**Version:** 1.0  
**Date:** September 2025  
**Target Audience:** AI Coding Agents & Developers  
**Parent Guide:** [deco-cx-store-migration-plan.md](./deco-cx-store-migration-plan.md)

This document contains real-world error handling patterns and security fixes derived from analyzing recent commits in production deco.cx stores.

## 🛡️ Security & Input Sanitization Patterns

### 1. Search Parameter Sanitization

**Real Issue Found:** VTEX search API was receiving malformed query strings and embedded data URIs causing 500 errors.

**Stack Trace Example:**
```
SearchResult: failed to load productListingPage err=Request failed with status 500
url=https://example-store.deco.site/search?q=product+data:text/html,<script>...
facets= sort= count=24 query=product+data:text/html,<script>... page=0 fuzzy=enabled hideUnavailableItems=true
```

**Solution Pattern:**
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

// Apply to URL path segments
const sanitizedSegments = currentUrl.pathname
    .split('/')
    .map(sanitizeSegment)
    .filter((item) => item !== '')

// Also sanitize query parameters
const query = searchTerm.replace(/\+/g, ' ').trim(); // Convert + to spaces
```

**Key Protections:**
- Block `data:` and `javascript:` schemes (both raw and URL-encoded)
- Limit segment length to prevent oversized payloads
- Proper URL encoding for search queries

### 2. Component Safety Guards

**Real Issue Found:** `BannerWithTitle` component crashing with "Cannot read properties of undefined (startsWith)"

**Stack Trace Pattern:**
```
TypeError: Cannot read properties of undefined (reading 'startsWith')
  at BannerWithTitle.tsx:45:23
  at renderToString (deno:ext/node/polyfills/_utils.ts:22:22)
```

**Solution Pattern:**
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
  
  // Provide safe fallback
  const fallbackSrc = mobileSrc || desktopSrc || '/static/placeholder.jpg'
  
  return (
    <Picture preload>
      {mobileSrc && (
        <Source 
          media="(max-width: 767px)" 
          src={mobileSrc}
          width={mobile.width}
          height={mobile.height}
        />
      )}
      {desktopSrc && (
        <Source 
          media="(min-width: 768px)" 
          src={desktopSrc}
          width={desktop.width} 
          height={desktop.height}
        />
      )}
      <img
        class="object-cover w-full h-full"
        loading="lazy"
        src={fallbackSrc}
        alt={title || "Banner"}
      />
    </Picture>
  )
}
```

## 🔄 Error Handling & Logging Patterns

### 1. Structured Error Logging for External APIs

**Real Implementation from production store:**
```typescript
// components/search/InfiniteScroll.tsx
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
    
    // Clear the next page to prevent infinite loading
    nextPage.value = null
    
    // Create structured error for monitoring
    const err = new Error(
        `InfiniteScroll: failed to fetch next page err=${
            (error as Error)?.message ?? 'unknown'
        } facets=${facetsStr} sort=${sort ?? ''} count=${pageInfo.recordPerPage} query=${
            query ?? ''
        } page=${pageInfo.currentPage - offset} fuzzy=${
            fuzzy ?? 'disabled'
        } hideUnavailableItems=true`,
    )
    
    // Re-throw so the framework/section error boundary can capture and log it
    throw err
}
```

**Key Pattern Elements:**
1. **Structured error messages** with all relevant parameters
2. **State cleanup** before throwing (clear loading states)
3. **Re-throw pattern** to let framework error boundaries handle logging
4. **Consistent error format** across similar components

### 2. Search Result Error Handling

**Pattern for Search/PLP Components:**
```typescript
// components/search/SearchResult.tsx
try {
    page = await ctx.invoke('vtex/loaders/intelligentSearch/productListingPage.ts', {
        selectedFacets: newSelectedFacets,
        sort: selectedSort as string,
        count: recordPerPage,
        query,
        page: currentPage,
        fuzzy: 'enabled',
        hideUnavailableItems: true,
    })
} catch (error) {
    const facetsStr = (newSelectedFacets ?? [])
        .map((f) => `${f.key}:${f.value}`)
        .join('|')
    
    throw new Error(
        `SearchResult: failed to load productListingPage err=${
            (error as Error)?.message ?? 'unknown'
        } url=${req.url} facets=${facetsStr} sort=${
            selectedSort ?? ''
        } count=${recordPerPage} query=${
            query ?? ''
        } page=${currentPage} fuzzy=enabled hideUnavailableItems=true`,
    )
}
```

### 3. UI State Management During Errors

**Real Implementation Pattern:**
```typescript
// components/search/InfiniteScroll.tsx - Button click handler
onClick={async (event) => {
    const target = event.currentTarget as HTMLElement
    target.setAttribute('data-loading', '')
    
    try {
        await fetchNextPage()
        // Only update UI state if successful
        if (typeof konfidencyLoader !== 'undefined') {
            konfidencyLoader.loadShowcase()
        }
    } finally {
        // Always clean up loading state, even on error
        target.removeAttribute('data-loading')
    }
}}
```

## 🎨 Image Optimization & Loading Patterns

### 1. Missing Height Warnings Fix

**Real Issue:** "Missing height. This image will NOT be optimized" logs in brand carousels

**Solution Pattern:**
```typescript
// components/ui/InfiniteSlider.tsx
{brands?.map((brand, index) => (
    <div key={index} class="min-w-[120px]">
        <img
            src={brand.src}
            alt={brand.alt}
            width={120}
            height={120} // ✅ Explicit height prevents optimization warnings
            class="object-contain"
            loading="lazy"
        />
    </div>
))}
```

**Critical Fix Points:**
- Brand carousel images need explicit square dimensions
- Product images should maintain aspect ratios with explicit dimensions
- Use `object-contain` for logos, `object-cover` for banners

### 2. Safe Image Component Pattern

**Template for Image Components:**
```typescript
interface ImageProps {
    src?: string
    alt?: string
    width?: number
    height?: number
    fallback?: string
}

export function SafeImage({ src, alt, width, height, fallback = '/static/placeholder.jpg' }: ImageProps) {
    const safeSrc = src || fallback
    
    return (
        <img
            src={safeSrc}
            alt={alt || "Image"}
            width={width || 300}
            height={height || 200}
            loading="lazy"
            onError={(e) => {
                const target = e.target as HTMLImageElement
                if (target.src !== fallback) {
                    target.src = fallback
                }
            }}
        />
    )
}
```

## 🚀 Performance & Caching Patterns

### 1. SWR Caching for Heavy Middleware

**Real Implementation:**
```typescript
// sections/SEO/SeoPLPV2Middleware.tsx
export const cache = 'stale-while-revalidate'

export default function SeoPLPV2Middleware(props: Props) {
    // Heavy SEO computation here...
    return <SEOComponent {...seoData} />
}
```

**Benefits:**
- Reduces server load on category pages
- Consistent SEO data across requests
- Better performance for repeat visitors

### 2. Duplicate Loader Elimination

**Real Issue:** Category pages were loading product lists twice - once in breadcrumbs, once in main content

**Solution:**
- Remove redundant `"Lista de Produtos - 20 Itens"` from breadcrumb sections
- Use shared loaders instead of duplicate API calls
- Consolidate data fetching at page level

## 🔧 Build System & Dependency Patterns

### 1. PostCSS Peer Dependency Resolution

**Real Issue Found:**
```
npm WARN cssnano@6.1.2 requires a peer of postcss@^8.4.31 but postcss@8.4.27 was installed
```

**Solution Pattern:**
```json
// deno.json
{
  "imports": {
    "postcss": "npm:postcss@8.4.38",
    "postcss@8.4.27": "npm:postcss@8.4.38"
  }
}
```

**Key Points:**
- Pin PostCSS to satisfy cssnano peer requirements  
- Use alias mapping to redirect old versions
- Test build after dependency changes

## 📊 Testing & Validation Checklist

### Error Handling Validation
- [ ] Search with malformed queries (e.g., `?q=test+data:text/html`)
- [ ] Components render with undefined/null image sources
- [ ] API failures don't crash the entire page
- [ ] Loading states are properly cleaned up on errors
- [ ] Error messages include structured context for debugging

### Performance Validation  
- [ ] No "Missing height" warnings in browser console
- [ ] SWR cache headers present on middleware responses
- [ ] No duplicate API calls on category pages
- [ ] Image optimization working properly

### Security Validation
- [ ] Search parameters are properly sanitized
- [ ] URL segments reject data URIs and javascript schemes
- [ ] No XSS vectors through search or filter parameters
- [ ] Error messages don't leak sensitive information

---

**Related Documents:**
- [deco-cx-store-migration-plan.md](./deco-cx-store-migration-plan.md) - Main migration guide
- [deco-cx-performance-optimizations.md](./deco-cx-performance-optimizations.md) - Performance patterns

**Last Updated:** September 2025