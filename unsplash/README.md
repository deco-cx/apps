# Unsplash App for deco.cx

This app provides integration with the Unsplash API for searching and displaying images in your deco.cx store.

## Configuration

To use this app, you need an Unsplash API key. You can get one for free by registering as a developer at [https://unsplash.com/developers](https://unsplash.com/developers).

## Loaders

All loaders accept a `responseType` parameter with the following values:
- `"full"`: Returns all data from the original API (more detailed, but larger response size)
- `"simple"`: Returns a simplified version with only essential data (default)
- `"urls"`: Returns only URLs and minimal information (lightest response, ideal for MPC)

### UNSPLASH_GET_PHOTO

Gets a specific photo from the Unsplash API by ID.

**Parameters:**
- `id`: Unsplash photo ID (required)
- `responseType`: Response detail level (`"full"`, `"simple"`, or `"urls"`, default: `"simple"`)

### UNSPLASH_LIST_PHOTOS

Lists photos from Unsplash with pagination.

**Parameters:**
- `page`: Page number for pagination (default: 1)
- `perPage`: Number of photos per page (default: 10)
- `responseType`: Response detail level (`"full"`, `"simple"`, or `"urls"`, default: `"simple"`)

### UNSPLASH_SEARCH_PHOTOS

Search photos on Unsplash by terms.

**Parameters:**
- `query`: Search query (required)
- `page`: Page number for pagination (default: 1)
- `perPage`: Number of photos per page (default: 10)
- `orientation`: Photo orientation (`"landscape"`, `"portrait"`, or `"squarish"`)
- `collections`: Collection IDs to filter results (comma separated)
- `contentFilter`: Content filter (`"low"` or `"high"`)
- `color`: Color filter (e.g., `"black_and_white"`, `"black"`, `"white"`, `"yellow"`, etc.)
- `responseType`: Response detail level (`"full"`, `"simple"`, or `"urls"`, default: `"simple"`)

## Performance for MPC

For Marketing Product Content (MPC), use the `responseType: "urls"` option to get only the essential image URLs and significantly reduce the response payload size.

## Attribution

When using Unsplash images, you must provide attribution to the photographer according to the [Unsplash guidelines](https://help.unsplash.com/en/articles/2511315-guideline-attribution).
