# Deco.cx Store Update & Migration Plan

**Version:** 1.0  
**Date:** September 2025  
**Target Audience:** AI Coding Agents & Developers

This comprehensive guide outlines the migration patterns and fixes required to upgrade older deco.cx stores based on analysis of recent fixes applied to jasmine, brandili, tools-dna, and apps repositories.

## 🎯 Overview

The deco.cx framework has evolved significantly, and older stores require systematic updates to maintain compatibility, performance, and security. This guide covers the most common issues found in legacy stores and their solutions.

## 🔧 Key Migration Areas

### 1. Dependency Management & Updates

#### 1.1 Core Dependencies Update
**Issue:** Outdated deco.cx core dependencies causing compatibility issues.

**Solution:**
```json
// deno.json - Update to latest stable versions
{
  "imports": {
    "deco/": "https://cdn.jsdelivr.net/gh/deco-cx/deco@1.120.11/",
    "apps/": "https://cdn.jsdelivr.net/gh/deco-cx/apps@0.121.0/",
    "@deco/deco": "jsr:@deco/deco@1.120.11",
    "@deco/dev": "jsr:@deco/dev@1.120.11",
    "$fresh/": "https://deno.land/x/fresh@1.7.3/"
  }
}
```

#### 1.2 Standard Library Migration
**Issue:** Old `std/` imports causing deprecation warnings.

**Solution:**
- Migrate from `https://deno.land/std@0.190.0/` to JSR-based imports:
```json
"@std/assert": "jsr:@std/assert@^1.0.2",
"@std/async": "jsr:@std/async@^0.224.1",
"@std/crypto": "jsr:@std/crypto@1.0.0-rc.1",
"@std/encoding": "jsr:@std/encoding@^1.0.0-rc.1",
"@std/http": "jsr:@std/http@^1.0.0"
```

#### 1.3 Remove Unnecessary Dependencies
**Common removals:**
- Remove unused social-library imports
- Clean up stray PostCSS version overrides
- Remove deprecated partytown references

### 2. DecoHub Cleanup & App Restructuring

#### 2.1 Remove Legacy DecHub References
**Issue:** Old `apps/decohub.ts` files and related blocks causing errors.

**Actions:**
1. Delete `apps/decohub.ts` file
2. Remove DecHub-related blocks from `.deco/blocks/`:
   - `Deco%20HUB.json`
   - `Workflows.json` (if DecHub-specific)
   - `sales-assistant.json`
   - `weather.json`
   - `files.json`

#### 2.2 Migrate to Namespaced Apps Structure
**Pattern:** Migrate from direct app imports to `apps/deco/` namespacing.

**Before:**
```
apps/
├── decohub.ts (delete)
├── algolia.ts (move)
├── analytics.ts (move)
└── vtex.ts (move)
```

**After:**
```
apps/
├── deco/
│   ├── algolia.ts
│   ├── analytics.ts
│   ├── htmx.ts
│   ├── vtex.ts
│   └── workflows.ts
└── site.ts
```

**File content example:**
```typescript
// apps/deco/analytics.ts
export { default } from "apps/analytics/mod.ts";
export * from "apps/analytics/mod.ts";
```

### 3. SEO Component Updates

#### 3.1 Migrate to SEOPLPv2 & SEOPDPv2
**Issue:** Outdated SEO components causing SSR compatibility issues.

**Actions:**
1. Update product pages to use `SeoPDPV2.tsx`
2. Update category pages to use `SeoPLPV2.tsx`
3. Remove old SEO component previews from `.deco/blocks/`

#### 3.2 Add Missing Image Dimensions
**Issue:** Images without proper dimensions causing layout shifts.

**Fix:** Ensure all components have proper `width` and `height` attributes:
```typescript
// components/footer/Logo.tsx
<img 
  src={src} 
  alt={alt}
  width={120}  // Add explicit dimensions
  height={40}
  loading="lazy"
/>
```

### 4. Performance Optimizations

#### 4.1 Enable Async Render for Better Performance
**Issue:** Synchronous rendering causing slower page loads and poor user experience.

**Solution:**
Implement async render for sections to reduce server-to-browser resource transfer and optimize loading performance.

**Benefits:**
- Reduced initial page load time
- Better perceived performance
- Optimized resource utilization
- Improved user experience metrics

**Implementation:**
1. **Configure sections for async rendering:**
```typescript
// sections/YourSection.tsx
export interface Props {
  // Your existing props
  asyncRender?: boolean; // Add async render flag
}

export default function YourSection(props: Props) {
  // Section implementation
}

// Add async configuration to section metadata
export const loader = async (props: Props, req: Request) => {
  // If async render enabled, return minimal data first
  if (props.asyncRender) {
    return {
      ...props,
      placeholder: true
    };
  }
  // Full data loading logic
};
```

2. **Enable in section blocks:**
```json
// .deco/blocks/your-section.json
{
  "asyncRender": true,
  "loadingStrategy": "lazy",
  "priority": "low"
}
```

**Performance Monitoring:**
- Monitor async render performance via deco.cx analytics
- Analyze section size optimization impact
- Track loading time improvements

#### 4.2 Implement Shared Loaders
**Issue:** Multiple duplicate API calls on category and search pages.

**Solution:**
Create shared loaders to reduce redundant requests:
```json
// .deco/blocks/Shared Category Loader.json
// .deco/blocks/Shared Search Loader.json
```

#### 4.2 Add Loading States & Error Handling
**Pattern:** Add proper loading fallbacks and dev-only error display.

```typescript
// sections/Component.tsx
export default function Component({ loader }: Props) {
  if (!loader) {
    if (Deno.env.get("DENO_ENV") === "development") {
      return <div>Error: Missing loader configuration</div>;
    }
    return <div>Loading...</div>;
  }
  
  return <YourComponent data={loader} />;
}
```

### 5. Search & Filter Improvements

#### 5.1 Fix Search Parameter Handling
**Issue:** Search forms sending '+' instead of '%20' for spaces.

**Fix:**
```typescript
// components/search/SearchForm.tsx
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  const query = searchTerm.replace(/\+/g, ' ').trim();
  const encodedQuery = encodeURIComponent(query);
  window.location.href = `/search?q=${encodedQuery}`;
};
```

#### 5.2 Implement Price Range Filters
**Issue:** Missing or broken price filtering functionality.

**Solution:** Update filter components with proper min/max handling and form submission.

### 6. Build System & Configuration Updates

#### 6.1 Update deno.json Configuration
**Required changes:**
```json
{
  "nodeModulesDir": true,  // Keep as true, "auto" fails in K8s production
  "lock": false,
  "exclude": [
    "node_modules",
    "static/",
    "README.md",
    "_fresh",
    "**/_fresh/*",
    ".deco"
  ],
  "lint": {
    "rules": {
      "exclude": ["no-window"],
      "tags": ["fresh", "recommended"]
    }
  }
}
```

#### 6.2 Update Fresh Configuration
**File:** `fresh.config.ts`
```typescript
import { defineConfig } from "$fresh/server.ts";
import plugins from "https://deno.land/x/fresh_charts@0.3.1/mod.ts";

export default defineConfig({
  plugins: [plugins],
});
```

### 7. SEO & Robots.txt Setup

#### 7.1 Add robots.txt
**File:** `static/robots.txt`
```
User-agent: *
Disallow: /

User-agent: Googlebot
Allow: /
Disallow: /live/
Disallow: /live/*
Sitemap: https://yourdomain.com/sitemap.xml
```

#### 7.2 Middleware for Bot Detection
Add bot detection and caching in `routes/_middleware.ts`.

### 8. SSR Compatibility Fixes

#### 8.1 Window Object Checks
**Issue:** Direct window access causing SSR failures.

**Fix:**
```typescript
// Use proper guards
if (typeof window !== 'undefined') {
  // Browser-only code
}
```

#### 8.2 Component Lazy Loading
Implement proper lazy loading for heavy components:
```typescript
// Use dynamic imports for client-side only components
const ClientOnlyComponent = lazy(() => import("../islands/ClientComponent.tsx"));
```

## 🚀 Migration Checklist

### Phase 1: Dependencies & Structure
- [ ] **Start with `deno task update`** - Update all dependencies to latest versions first
- [ ] Update core deco.cx dependencies to latest stable versions (1.120.11+)
- [ ] Migrate std library imports to JSR (handled by deno task update)
- [ ] Remove unnecessary dependencies
- [ ] Clean up DecHub references
- [ ] Restructure apps directory with proper namespacing

### Phase 2: Components & SEO
- [ ] Update SEO components to v2 versions
- [ ] Add missing image dimensions
- [ ] Fix SSR compatibility issues
- [ ] Update search parameter handling

### Phase 3: Performance & Caching
- [ ] Enable async render for heavy sections (ProductShelf, CategoryList, etc.)
- [ ] Implement shared loaders
- [ ] Add cache middleware
- [ ] Add loading states and error handling
- [ ] Optimize component rendering

### Phase 4: Configuration & Build
- [ ] Update deno.json configuration
- [ ] Update Fresh configuration
- [ ] Add/update robots.txt
- [ ] Regenerate manifest files
- [ ] Test build and deployment

## 🔍 Common Issues & Solutions

### Issue: "Module not found" errors
**Cause:** Outdated import paths or missing dependencies
**Solution:** Update import maps in deno.json and regenerate manifest

### Issue: SSR hydration mismatches
**Cause:** Client-server rendering differences
**Solution:** Add proper typeof window checks and use islands for dynamic content

### Issue: Performance degradation
**Cause:** Multiple duplicate API calls
**Solution:** Implement shared loaders and proper caching

### Issue: SEO problems
**Cause:** Missing or outdated SEO components
**Solution:** Migrate to latest SEO component versions

## 📚 Lessons Learned from Real Migration Work

Based on analyzing the miess-01 repository and applying fixes:

### ✅ **What Works Well in Existing Stores**
- **Apps structure already migrated**: Many stores have already been updated to use `apps/deco/` namespacing
- **No DecHub references**: Most legacy DecHub cleanup has already been done
- **Good SEO foundation**: Custom SEO components and robots.txt are properly configured
- **Proper image handling**: Many components already use explicit dimensions and Picture components

### 🔧 **Critical Fixes Often Needed**
1. **Dependency versions**: Always update deco.cx core to latest stable (1.120.11+)
2. **Window object guards**: Analytics and client-side code needs `typeof window !== 'undefined'` checks
3. **Search parameter encoding**: Use `encodeURIComponent()` instead of manual string replacement
4. **Image dimensions**: Add explicit `width` and `height` attributes to prevent layout shifts
5. **Fresh config plugins**: Ensure `tailwind` is passed to plugins configuration

### 🎯 **Common Patterns for Window Guards**
```typescript
// ❌ Bad - Direct window access
window.DECO.events.dispatch(event)

// ✅ Good - With guards
if (typeof window !== 'undefined' && window.DECO?.events) {
  window.DECO.events.dispatch(event)
}
```

### 🚫 **Don't Need to Regenerate Manifest**
After dependency updates, you DON'T need to run `deno task gen` - this was a misconception in earlier migration guides. The build process handles this automatically.

### 🔄 **Std Import Migration is Automatic**
When you run `deno task update`, Deno automatically handles the migration of `std/` imports to JSR `@std/` imports. **DO NOT** manually change import statements in your code files - let Deno handle this automatically through its dependency resolution.

### ⚡ **Priority Order for Fixes**
1. **SSR compatibility** (window guards) - prevents runtime errors
2. **Dependency updates** - ensures compatibility and security
3. **Performance optimizations** - image dimensions, async render
4. **Search functionality** - parameter encoding affects UX
5. **Build configuration** - nodeModulesDir, excludes

## 🤖 Evolution Agent Workflow Menu

These are key optimization workflows that can be applied to any deco.cx store:

### Quick Optimization Menu
1. **Enable Async Render** - Apply async rendering to heavy sections for performance
2. **Update Dependencies** - Migrate to latest stable versions
3. **Clean DecHub References** - Remove legacy DecHub imports and blocks
4. **Implement Caching** - Add cache middleware for bot traffic
5. **Fix SEO Components** - Update to latest SEO component versions
6. **Add Shared Loaders** - Reduce duplicate API calls
7. **SSR Compatibility Check** - Fix window object access issues

### Async Render Activation Workflow
**When to use:** Any store with slow loading sections (ProductShelf, CategoryList, SearchResults)

**Steps:**
1. Identify heavy sections in the store
2. Add async render configuration to section props
3. Update section blocks with async settings
4. Test performance improvements
5. Monitor loading metrics

**Priority sections for async render:**
- ProductShelf components
- CategoryList sections  
- SearchResult displays
- Complex filter components
- Image-heavy carousels

## 📋 Automated Migration Script Template

```bash
#!/bin/bash

# 1. Backup current state
git checkout -b migration-backup

# 2. Update dependencies (includes automatic std import migration)
echo "Updating dependencies and migrating std imports automatically..."
deno task update

# 3. Clean up structure
echo "Cleaning up DecHub references..."
rm -f apps/decohub.ts
rm -f .deco/blocks/Deco\ HUB.json

# 4. Enable async render for performance sections
echo "Configuring async render..."
# Update heavy sections with async configuration

# 5. Run checks
echo "Running checks..."
deno task check

# 6. Test build
echo "Testing build..."
deno task build
```

## 🎯 Success Metrics

After migration, verify:
- [ ] All TypeScript checks pass
- [ ] Build completes without errors
- [ ] No console errors in browser
- [ ] SEO components render properly
- [ ] Performance metrics improved
- [ ] Cache headers present for bot traffic

---

**Note:** Always test migrations in a staging environment before applying to production. Keep backups of working configurations.

**Last Updated:** September 2025  
**Framework Version:** Deco.cx 1.120.11+