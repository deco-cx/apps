# Reflect App for Deco.cx

This app provides integration with the [Reflect](https://reflect.app) API, allowing you to interact with your note-taking system programmatically.

## Authentication

Reflect uses OAuth for authentication. You will need to create credentials at https://reflect.app/developer/oauth. You can generate an access token from that interface, which essentially functions as an API key.

To use this app, you'll need to provide the OAuth token when configuring the app in your deco.cx project.

## Available Loaders

### `me`

Gets the authenticated user's information.

### `graphs`

Gets all graphs available to the authenticated user.

### `graphs/books`

Gets all books from a specific graph.

### `graphs/links`

Gets all links from a specific graph.

## Available Actions

### `links/create`

Creates a new link in a specific graph.

### `daily-notes/append`

Appends text to a daily note in a specific graph.

### `notes/create`

Creates a new note in a specific graph.

## Note on End-to-End Encryption

Reflect notes are end-to-end encrypted. The Reflect API is append-only for note-related endpoints because the servers can't read the contents of your notes. Keep this in mind when using this app. 