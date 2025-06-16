# YouTube App Refactoring Checklist

## Overview

This document tracks the refactoring progress of all loaders and actions in the
YouTube app to follow the clean pattern established in google-sheets.

## Refactoring Rules

### General Guidelines

- Clean code from comments (keep only JSDoc)
- Remove all `//` comments from code
- Remove cache code
- Document all props with `@description` and descriptive `@title`
- **Description only works on a single line** - anything beyond that won't be
  read
- Everything in English
- Extract constants and text to `constants.ts` and call variables to facilitate
  bulk changes
- Always follow the example code pattern from getValues.ts
- **IMPORTANT: Always use ctx.client instead of fetch** - client has refresh
  token and other important features built in
- When using ctx.client, always use two parameters:
  1. The first parameter is a JSON with all query params and any URL template
     variables (e.g., for videos/:videoId, use videoId: value)
  2. The second parameter is a JSON with the body and headers, e.g., { body: {
     ... }, headers: { ... } }
  3. If the endpoint only needs a body, always pass the first parameter as an
     empty object: ctx.client["METHOD /endpoint"]({}, { body: { ... } })
  4. Always check the client.ts file for the correct typing and required fields
- If a route using client is showing errors, add the missing type to client.ts
- Use tryCatch only around the necessary code blocks, not the entire function
- Move complex type definitions to types.ts if they're reusable or already exist
  there

### Code Example to Follow

```typescript
import { AppContext } from "../mod.ts";
import { ValueRange } from "../utils/types.ts";

export interface Props {
  /**
   * @title Spreadsheet ID
   * @description The ID of the Google Sheets spreadsheet
   */
  spreadsheetId: string;

  /**
   * @title Range
   * @description The range of cells in A1 notation (e.g., Sheet1!A1:B10) without quotes
   */
  range: string;

  /**
   * @title Major Dimension
   * @description Determines how to organize the values in the matrix (by rows or columns)
   */
  majorDimension?: "ROWS" | "COLUMNS";
}

/**
 * @name GET_SPREADSHEET_VALUES
 * @title Get Spreadsheet Values
 * @description Gets the values from a specific range of cells in the spreadsheet
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ValueRange> => {
  const {
    spreadsheetId,
    range,
    majorDimension = "ROWS",
  } = props;

  try {
    const response = await ctx.client["GET /endpoint"](
      {
        // Query params and URL variables here
      },
      {
        // Body and headers here (if needed)
      },
    );

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error message: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to perform operation`,
    );
  }
};

export default loader;
```

## Progress Tracking

### Phase 1: Loaders (Start Here)

#### Analytics

- [x] `loaders/analytics/channelStats.ts` ✅ **COMPLETED**
- [x] `loaders/analytics/videoStats.ts` ✅ **COMPLETED**

#### Channels

- [x] `loaders/channels/get.ts` ✅ **COMPLETED**

#### Comments

- [x] `loaders/comments/list.ts` ✅ **COMPLETED**
- [x] `loaders/comments/threads.ts` ✅ **COMPLETED**

#### Livestreams

- [x] `loaders/livestreams/list.ts` ✅ **COMPLETED**
- [x] `loaders/livestreams/streams.ts` ✅ **COMPLETED**

#### OAuth

- [x] `loaders/oauth/start.ts` (Already refactored)

#### Videos

- [x] `loaders/videos/captions.ts` ✅ **COMPLETED**
- [x] `loaders/videos/categories.ts` ✅ **COMPLETED**
- [x] `loaders/videos/channelVideos.ts` ✅ **COMPLETED**
- [x] `loaders/videos/details.ts` ✅ **COMPLETED**
- [x] `loaders/videos/list.ts` ✅ **COMPLETED**
- [x] `loaders/videos/search.ts` ✅ **COMPLETED**

### Phase 2: Actions (After Loaders)

#### Channels

- [x] `actions/channels/update.ts` ✅ **COMPLETED**
- [x] `actions/channels/updateDefaults.ts` ✅ **COMPLETED**
- [x] `actions/channels/updateSections.ts` ✅ **COMPLETED**

#### Comments

- [x] `actions/comments/create.ts` ✅ **COMPLETED**
- [x] `actions/comments/pin.ts` ✅ **COMPLETED**
- [x] `actions/comments/rate.ts` ✅ **COMPLETED**
- [x] `actions/comments/reply.ts` ✅ **COMPLETED**

#### Livestreams

- [x] `actions/livestreams/bind.ts` ✅ **COMPLETED**
- [x] `actions/livestreams/create.ts` ✅ **COMPLETED**
- [x] `actions/livestreams/createStream.ts` ✅ **COMPLETED**
- [x] `actions/livestreams/delete.ts` ✅ **COMPLETED**
- [x] `actions/livestreams/transition.ts` ✅ **COMPLETED**
- [x] `actions/livestreams/update.ts` ✅ **COMPLETED**
- [x] `actions/livestreams/updateThumbnail.ts` ✅ **COMPLETED**

#### OAuth

- [x] `actions/oauth/callback.ts` (Already refactored)

#### Videos

- [x] `actions/videos/delete.ts` ✅ **COMPLETED**
- [x] `actions/videos/update.ts` ✅ **COMPLETED**
- [x] `actions/videos/updateCategory.ts` ✅ **COMPLETED**
- [x] `actions/videos/updateThumbnail.ts` ✅ **COMPLETED**

## Constants to Extract

Common strings that appear multiple times and should be moved to `constants.ts`:

- `"snippet"` - Very common across all files
- `"contentDetails"`
- `"statistics"`
- `"status"`
- `"id"`
- `"part"`
- Error messages
- Default values

## Next Steps

1. ~~**FIX ALL LOADERS: Replace fetch with client** - This is critical~~ ✅
   **COMPLETED**
2. **START REFACTORING ACTIONS: Replace fetch with client** - Begin with
   actions/videos/delete.ts
3. Follow the pattern established in getValues.ts
4. Extract repeated strings to constants
5. Test each file after refactoring
6. Update this checklist as files are completed

## Notes

- Keep the OAuth loaders/actions as they are already correctly implemented
- Focus on making the code clean, readable, and maintainable
- Use proper error handling with ctx.errorHandler
- Remove all cache-related code
- Ensure all props are properly documented
- **ALWAYS use ctx.client instead of fetch** - client handles token refresh and
  other important features
