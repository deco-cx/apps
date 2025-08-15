# Figma App

This is a deco app for the Figma API, which is described below.

## TODO: Implement oAuth

## Authentication

To authenticate API calls, the client must add the following header:
```
Authorization: Bearer XXX
```
where XXX is the access token obtained from the OAuth2 flow or the Personal Access Token obtained from the Figma app.

## API Calls

The API domain is: https://www.figma.com/api

### GET /v1/files/:key

Returns the document referenced by :key as a JSON object. The file key can be parsed from any Figma URL: https://www.figma.com/:file_type/:file_key/:file_name.

Path Parameters:
- `key` - String - File to export JSON from. Can be a file key or branch key.

Query Parameters:
- `version` - String (optional) - A specific version ID to get
- `ids` - String (optional) - Comma separated list of nodes you care about in the document
- `depth` - Number (optional) - Positive integer representing how deep into the document tree to traverse
- `geometry` - String (optional) - Set to "paths" to export vector data
- `plugin_data` - String (optional) - A comma separated list of plugin IDs
- `branch_data` - Boolean (optional) - Returns branch metadata for the requested file

Example response:
```json
{
  "name": String,
  "role": String,
  "lastModified": String,
  "editorType": String,
  "thumbnailUrl": String,
  "version": String,
  "document": Node,
  "components": Map<String, Component>,
  "componentSets": Map<String, ComponentSet>,
  "schemaVersion": 0,
  "styles": Map<String, Style>
}
```

### GET /v1/files/:key/nodes

Returns the nodes referenced by :ids as a JSON object.

Path Parameters:
- `key` - String - File to export JSON from

Query Parameters:
- `ids` - String - A comma separated list of node IDs to retrieve
- `version` - String (optional) - A specific version ID to get
- `depth` - Number (optional) - Depth of the node tree
- `geometry` - String (optional) - Set to "paths" to export vector data
- `plugin_data` - String (optional) - List of plugin IDs

### GET /v1/images/:key

Renders images from a file.

Path Parameters:
- `key` - String - File to export images from

Query Parameters:
- `ids` - String - Comma separated list of node IDs to render
- `scale` - Number (optional) - A number between 0.01 and 4, the image scaling factor
- `format` - String (optional) - Output image format (jpg, png, svg, or pdf)
- `svg_outline_text` - Boolean (optional) - Whether text elements are rendered as outlines
- `svg_include_id` - Boolean (optional) - Whether to include id attributes for all SVG elements
- `version` - String (optional) - A specific version ID to use

### GET /v1/files/:key/images

Returns download links for all images present in image fills in a document.

Path Parameters:
- `key` - String - File to get image URLs from

## References

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP)

## Available Loaders

### FILE_PROFILE

Gets detailed information about a Figma file, including metadata, document and components.

```typescript
import { getFileProfile } from "figma/loaders/profile.ts";

const profile = await getFileProfile({
  fileKey: "your_file_key_here",
  // optionally: version, depth, branch_data
});
```

### FILE_COMPONENTS

Gets the components of a Figma file, including metadata and detailed information.

```typescript
import { getFileComponents } from "figma/loaders/components.ts";

const components = await getFileComponents({
  fileKey: "your_file_key_here",
  // optionally: version, depth, branch_data
});
```

### FILE_NODES

Gets specific nodes from a Figma file, including metadata and detailed information.

```typescript
import { getFileNodes } from "figma/loaders/nodes.ts";

const nodes = await getFileNodes({
  fileKey: "your_file_key_here",
  nodeIds: ["1:2", "1:3"],
  // optionally: version, depth, geometry
});
```

### FILE_IMAGES

Gets images from specific nodes of a Figma file.

```typescript
import { getFileImages } from "figma/loaders/images.ts";

const images = await getFileImages({
  fileKey: "your_file_key_here",
  nodeIds: ["1:2", "1:3"],
  // optionally: scale, format, svg_outline_text, svg_include_id, svg_include_node_id, 
  // svg_simplify_stroke, contents_only, use_absolute_bounds, version
});
```

### FILE_IMAGE_FILLS

Gets download URLs for all images present in image fills in a document.

```typescript
import { getFileImageFills } from "figma/loaders/image-fills.ts";

const imageFills = await getFileImageFills({
  fileKey: "your_file_key_here",
});
```

### FILE_SIMPLIFIED

Gets a simplified version of the data from a Figma file, including only the most relevant information.

```typescript
import { getFileSimplified } from "figma/loaders/simplified.ts";

const simplified = await getFileSimplified({
  fileKey: "your_file_key_here",
  // optionally: version, depth, branch_data
});
```

### FILE_SIMPLIFIED_NODES

Gets specific nodes from a Figma file in simplified format.

```typescript
import { getFileSimplifiedNodes } from "figma/loaders/simplified-nodes.ts";

const simplifiedNodes = await getFileSimplifiedNodes({
  fileKey: "your_file_key_here",
  nodeIds: ["1:2", "1:3"],
  // optionally: version, depth, geometry
});
```

## Utilities

### Simplifier

The simplification utility (`utils/simplifier.ts`) provides functions to simplify Figma data, including only the most relevant information.

```typescript
import { simplifyNode, simplifyComponent, simplifyComponentSet, simplifyStyle, simplifyDocument } from "figma/utils/simplifier.ts";

// Simplify a node
const simplifiedNode = simplifyNode(node);

// Simplify a component
const simplifiedComponent = simplifyComponent(component);

// Simplify a component set
const simplifiedComponentSet = simplifyComponentSet(componentSet);

// Simplify a style
const simplifiedStyle = simplifyStyle(style);

// Simplify a document
const simplifiedDocument = simplifyDocument(document);
```

## Configuration

To use this app, you need to configure OAuth 2.0 with your Figma application.

First, set up the environment variables:
- `FIGMA_CLIENT_ID`: Your Figma OAuth app client ID
- `FIGMA_CLIENT_SECRET`: Your Figma OAuth app client secret

```typescript
import { App } from "figma/mod.ts";

const figmaApp = App({
  clientId: Deno.env.get("FIGMA_CLIENT_ID"),
  clientSecret: Deno.env.get("FIGMA_CLIENT_SECRET"),
});
```

The OAuth flow will handle token management automatically, including refresh when needed.