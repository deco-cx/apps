# Tiptap Cloud Integration

This module provides integration with the Tiptap Cloud Collaboration API for document management!

## Features

- Create documents using JSON or YJS format
- Retrieve documents in various formats (JSON, YJS, base64, text)
- List all documents with pagination
- Update existing documents
- Delete documents
- Perform semantic search across documents

## Configuration

To use this integration, you need to provide your Tiptap Cloud App ID and API Secret, which can be found in your Tiptap Cloud dashboard settings.

```ts
import TiptapCloud from "deco-sites/std/tiptap-cloud/mod.ts";

// Initialize Tiptap Cloud with your credentials
const tiptapCloud = TiptapCloud({
  appId: "YOUR_APP_ID",
  apiSecret: "YOUR_API_SECRET_FROM_SETTINGS_AREA",
});
```

## API Reference

For more information about the Tiptap Cloud Collaboration API, please refer to the [official documentation](https://tiptap.dev/docs/collaboration/documents/rest-api). 