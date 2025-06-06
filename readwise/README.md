# Readwise App for Deco

This app provides integration with the [Readwise API](https://readwise.io/api_deets), allowing you to fetch and save reading highlights.

## Features

- Export all highlights from a Readwise account with pagination support
- List books and highlights with filtering options
- Get daily review highlights
- Create new highlights
- Update existing highlights

## Setup

1. Get your Readwise access token from [readwise.io/access_token](https://readwise.io/access_token)
2. Install the app in your deco project
3. Configure the app with your access token

## Usage Examples

### Exporting All Highlights

```ts
// Fetch all highlights
const allHighlights = await loaders.readwise.loaders.exportHighlights({});

// Fetch only highlights updated after a specific date
const newHighlights = await loaders.readwise.loaders.exportHighlights({
  updatedAfter: "2023-01-01T00:00:00Z" 
});
```

### Creating Highlights

```ts
// Save a highlight to Readwise
const result = await actions.readwise.actions.createHighlights({
  highlights: [
    {
      text: "This is a highlight",
      title: "Book Title",
      author: "Author Name",
      source_type: "my_app",
      category: "books"
    }
  ]
});
```

### Getting Daily Review

```ts
// Fetch daily review highlights
const dailyReview = await loaders.readwise.loaders.dailyReview({});
```

## Documentation

For more details on the Readwise API, see the [official documentation](https://readwise.io/api_deets). 