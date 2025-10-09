# New VTEX App Tools Summary

This document provides an overview of the new tools added to the VTEX app based on the Excalidraw specifications.

## Tools Created

### 1. Promotions & Taxes API (Rates & Benefits v1)

#### Loaders (Read Operations)

- **`loaders/promotions/listAll.ts`**
  - **Title**: List All Promotions
  - **Description**: Get all promotions and taxes configured in your store
  - **Inputs**: None
  - **Output**: Array of promotion configurations

- **`loaders/promotions/searchByName.ts`**
  - **Title**: Search Promotions By Name
  - **Description**: Search for promotions by name
  - **Inputs**: 
    - `byName` (string): Promotion name to search for
  - **Output**: Array of matching promotions

- **`loaders/promotion/getPromotionById.ts`** *(Already existed)*
  - **Title**: Get Promotion By ID
  - **Description**: Get a promotion by its ID
  - **Inputs**:
    - `idCalculatorConfiguration` (string): Promotion ID
  - **Output**: Promotion configuration object

#### Actions (Write Operations)

- **`actions/promotions/upsert.ts`**
  - **Title**: Create or Update Promotion
  - **Description**: Create a new promotion or update an existing one
  - **Inputs**:
    - `body` (PromotionConfiguration): Complete promotion configuration including:
      - `idCalculatorConfiguration` (optional): Promotion ID (for update)
      - `name` (required): Promotion name
      - `beginDateUtc` (required): Start date in ISO 8601 format
      - `endDateUtc` (optional): End date in ISO 8601 format
      - `isActive` (optional): Activation status
      - `scope` (optional): Categories, brands, SKUs, collections
      - `ratesAndBenefitsData` (optional): Promotion-specific configuration
      - And many other configuration options
  - **Output**: Created/updated promotion object

- **`actions/promotions/archive.ts`**
  - **Title**: Archive Promotion
  - **Description**: Archive a promotion by its ID
  - **Inputs**:
    - `idCalculatorConfiguration` (string): Promotion ID to archive
  - **Output**: Success response

- **`actions/promotions/unarchive.ts`**
  - **Title**: Unarchive Promotion
  - **Description**: Unarchive a promotion by its ID
  - **Inputs**:
    - `idCalculatorConfiguration` (string): Promotion ID to unarchive
  - **Output**: Success response

- **`actions/promotions/importCreateCsv.ts`**
  - **Title**: Import Promotions from CSV (Create)
  - **Description**: Import and create promotions in bulk from a CSV file
  - **Inputs**:
    - `csvFile` (string): CSV file content as base64 or text
    - `headers` (optional): CSV headers mapping (e.g., X-VTEX-calculator-name, X-VTEX-start-date)
  - **Output**: Import result

- **`actions/promotions/importUpdateCsv.ts`**
  - **Title**: Import Promotions from CSV (Update)
  - **Description**: Update promotions in bulk from a CSV file
  - **Inputs**:
    - `promotionId` (string): Promotion ID to update
    - `csvFile` (string): CSV file content
    - `headers` (optional): CSV headers mapping
  - **Output**: Update result

### 2. Orders API (OMS)

- **`loaders/orders/listByRange.ts`**
  - **Title**: List Orders by Range with Filters
  - **Description**: Get a list of orders with filters for date range, status, and other criteria
  - **Inputs**:
    - `page` (optional, default: 1): Page number for pagination
    - `per_page` (optional, default: 15): Number of orders per page
    - `orderBy` (optional, default: "creationDate,desc"): Sort field and direction
    - `q` (optional): Search query
    - `f_creationDate` (optional): Filter by creation date range
    - `f_status` (optional): Filter by order status
    - `f_salesChannel` (optional): Filter by sales channel
    - `f_shippingEstimate` (optional): Filter by shipping method
    - `f_UtmSource` (optional): Filter by UTM source
    - `f_UtmCampaign` (optional): Filter by UTM campaign
    - `f_sellerNames` (optional): Filter by seller
    - `f_affiliateId` (optional): Filter by affiliate ID
  - **Output**: Paginated list of orders

- **`loaders/orders/getById.ts`** *(Already existed)*
  - **Title**: Get Order By ID
  - **Description**: Get order details by order ID
  - **Inputs**:
    - `orderId` (string): Order ID
  - **Output**: Order details

### 3. Checkout API

- **`actions/cart/simulation.ts`** *(Already existed)*
  - **Title**: Simulation OrderForm
  - **Description**: Simulate an orderForm, used for shipping and pricing simulation (including promotion validation)
  - **Inputs**:
    - `items` (Item[]): Array of items with id, quantity, seller
    - `country` (string): Country code
    - `postalCode` (optional, string): Postal code
    - `RnbBehavior` (optional, 0|1): Rates and Benefits behavior
  - **Output**: Simulated order form with pricing and promotion details

### 4. Catalog API

- **`loaders/catalog/searchSkus.ts`**
  - **Title**: Search SKUs/Products
  - **Description**: Search for SKUs and Products using fulltext search
  - **Inputs**:
    - `term` (string): Search term
    - `category` (optional): Filter by category ID
    - `brand` (optional): Filter by brand ID
    - `page` (optional, default: 0): Page number
    - `count` (optional, default: 50): Items per page
  - **Output**: Array of products/SKUs matching the search

- **`loaders/collections/list.ts`** *(Already existed)*
  - **Title**: Get Collection List
  - **Description**: Get the list of collections
  - **Inputs**:
    - `term` (optional): Search term
  - **Output**: List of collections

- **`loaders/categories/tree.ts`** *(Already existed)*
  - **Title**: Get Category Tree
  - **Description**: Get the category tree
  - **Inputs**:
    - `categoryLevels` (optional, default: 1): Number of category levels
  - **Output**: Category tree structure

- **`loaders/legacy/brands.ts`** *(Already existed)*
  - **Title**: Brand List
  - **Description**: List all brands
  - **Inputs**:
    - `filterInactive` (optional, default: false): Filter out inactive brands
  - **Output**: List of brands

## Use Cases

### Use Case 1: Create, Update, and Archive Promotions
The promotion tools enable you to:
- List all existing promotions
- Search for specific promotions by name
- Create new promotions with complex rules
- Update existing promotions
- Archive/unarchive promotions when needed
- Bulk import/update promotions via CSV files

**Example workflow**:
1. Use `listAll` to see existing promotions
2. Use `upsert` to create a new promotion with specific date ranges and conditions
3. Use `archive` to deactivate a promotion that has ended

### Use Case 2: Analyze Promotion Performance with Order Data
Cross-reference promotion data with order information:
- List orders within a specific date range using `listByRange`
- Filter orders by status, sales channel, or UTM parameters
- Analyze which promotions are being applied to orders
- Track promotion effectiveness over time

**Example workflow**:
1. Use `listByRange` with `f_creationDate` and `f_status` filters
2. Analyze order totals and applied promotions
3. Adjust promotion configurations based on performance

### Use Case 3: Simulate Checkout to Validate Promotions
Before activating a promotion, verify it works correctly:
- Use `checkout.simulate` to test cart scenarios
- Verify that the correct promotions are being applied
- Check discount calculations and pricing
- Ensure promotion rules work as intended

**Example workflow**:
1. Create a promotion using `upsert`
2. Use `simulation` with test items and postal code
3. Verify the promotion is correctly applied in the response
4. Activate the promotion if validation passes

### Use Case 4: Natural Language Integration with Correct IDs
Enable AI assistants or chatbots to work with VTEX data:
- Search for products by name using `searchSkus`
- Find specific collections, categories, and brands
- Get exact IDs for use in promotion configuration
- Build promotion rules using natural language

**Example workflow**:
1. User asks: "Create a promotion for Nike shoes"
2. Use `brands.list` to find Nike's brand ID
3. Use `searchSkus` with term "shoes" and Nike brand filter
4. Use the IDs to configure a promotion via `upsert`

## API Endpoints Added to VCS OpenAPI Schema

The following endpoints were added to `/utils/openapi/vcs.openapi.gen.ts`:

1. `GET /api/rnb/pvt/calculatorconfiguration` - List all promotions
2. `GET /api/rnb/pvt/calculatorconfiguration/_search` - Search promotions by name
3. `POST /api/rnb/pvt/calculatorconfiguration` - Create/update promotion
4. `POST /api/rnb/pvt/calculatorconfiguration/:idCalculatorConfiguration/archive` - Archive promotion
5. `POST /api/rnb/pvt/calculatorconfiguration/:idCalculatorConfiguration/unarchive` - Unarchive promotion
6. `POST /api/rnb/pvt/calculatorconfiguration/import` - Import promotions from CSV
7. `POST /api/rnb/pvt/calculatorconfiguration/:idCalculatorConfiguration/import` - Update promotions from CSV
8. `GET /api/oms/pvt/orders` - List orders with filters

## Notes

- All promotion-related tools require authentication and proper VTEX app credentials
- The `defaultVisibility` is set to `private` for all promotion and order tools for security
- CSV import/update tools expect specific VTEX header formats (X-VTEX-*)
- The checkout simulation tool already existed and supports promotion validation
- All catalog tools for collections, categories, and brands already existed

## Files Modified

### New Files Created
- `/vtex/loaders/promotions/listAll.ts`
- `/vtex/loaders/promotions/searchByName.ts`
- `/vtex/actions/promotions/upsert.ts`
- `/vtex/actions/promotions/archive.ts`
- `/vtex/actions/promotions/unarchive.ts`
- `/vtex/actions/promotions/importCreateCsv.ts`
- `/vtex/actions/promotions/importUpdateCsv.ts`
- `/vtex/loaders/orders/listByRange.ts`
- `/vtex/loaders/catalog/searchSkus.ts`

### Modified Files
- `/vtex/utils/openapi/vcs.openapi.gen.ts` - Added new API endpoint definitions

## Next Steps

After these tools are integrated, you may want to:
1. Update the manifest file if auto-generation doesn't pick up the new tools
2. Test each tool with your VTEX account credentials
3. Create example workflows or documentation for end users
4. Consider adding additional validation or error handling
5. Monitor API usage and rate limits

