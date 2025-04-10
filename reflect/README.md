# Reflect App for Deco.cx

This app provides integration with the [Reflect](https://reflect.app) API, allowing you to interact with your note-taking system programmatically.

## Authentication

Reflect uses OAuth for authentication. You will need to create credentials at https://reflect.app/developer/oauth. You can generate an access token from that interface, which essentially functions as an API key.

To use this app, you'll need to provide the OAuth token when configuring the app in your deco.cx project.

## Available Loaders

### `me`

Gets the authenticated user's information.

```ts
import { AppContext } from "apps/reflect/mod.ts";

export default function MyComponent({ user }: { user: Awaited<ReturnType<typeof loader>> }) {
  return (
    <div>
      <h1>Hello, {user.name}</h1>
      <p>User ID: {user.uid}</p>
    </div>
  );
}

export const loader = (props: unknown, req: Request, ctx: AppContext) => {
  return ctx.reflect.loaders.me();
};
```

### `graphs`

Gets all graphs available to the authenticated user.

```ts
import { AppContext } from "apps/reflect/mod.ts";

export default function MyComponent({ graphs }: { graphs: Awaited<ReturnType<typeof loader>> }) {
  return (
    <div>
      <h1>Your Graphs</h1>
      <ul>
        {graphs.map((graph) => (
          <li key={graph.id}>{graph.name}</li>
        ))}
      </ul>
    </div>
  );
}

export const loader = (props: unknown, req: Request, ctx: AppContext) => {
  return ctx.reflect.loaders.graphs();
};
```

### `graphs/books`

Gets all books from a specific graph.

```ts
import { AppContext } from "apps/reflect/mod.ts";

export default function MyComponent({ books }: { books: Awaited<ReturnType<typeof loader>> }) {
  return (
    <div>
      <h1>Your Books</h1>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <h2>{book.title}</h2>
            <p>By: {book.authors?.join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const loader = (props: { graphId: string }, req: Request, ctx: AppContext) => {
  return ctx.reflect.loaders["graphs/books"](props);
};
```

### `graphs/links`

Gets all links from a specific graph.

```ts
import { AppContext } from "apps/reflect/mod.ts";

export default function MyComponent({ links }: { links: Awaited<ReturnType<typeof loader>> }) {
  return (
    <div>
      <h1>Your Links</h1>
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.title || link.url}
            </a>
            {link.description && <p>{link.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const loader = (props: { graphId: string }, req: Request, ctx: AppContext) => {
  return ctx.reflect.loaders["graphs/links"](props);
};
```

## Available Actions

### `links/create`

Creates a new link in a specific graph.

```ts
import { AppContext } from "apps/reflect/mod.ts";

export default function LinkForm() {
  return (
    <form action="/api/reflect/links/create" method="post">
      <input type="hidden" name="graphId" value="your-graph-id" />
      <input type="text" name="url" placeholder="URL" required />
      <input type="text" name="title" placeholder="Title" />
      <textarea name="description" placeholder="Description"></textarea>
      <button type="submit">Save Link</button>
    </form>
  );
}

export const action = async (props: {
  graphId: string;
  url: string;
  title?: string;
  description?: string;
  highlights?: string[];
}, req: Request, ctx: AppContext) => {
  return await ctx.reflect.actions["links/create"](props);
};
```

### `daily-notes/append`

Appends text to a daily note in a specific graph.

```ts
import { AppContext } from "apps/reflect/mod.ts";

export default function DailyNoteForm() {
  return (
    <form action="/api/reflect/daily-notes/append" method="post">
      <input type="hidden" name="graphId" value="your-graph-id" />
      <input type="date" name="date" />
      <textarea name="text" required placeholder="Note content"></textarea>
      <input type="text" name="list_name" placeholder="List name" />
      <button type="submit">Add to Daily Note</button>
    </form>
  );
}

export const action = async (props: {
  graphId: string;
  date?: string;
  text: string;
  list_name?: string;
}, req: Request, ctx: AppContext) => {
  return await ctx.reflect.actions["daily-notes/append"](props);
};
```

### `notes/create`

Creates a new note in a specific graph.

```ts
import { AppContext } from "apps/reflect/mod.ts";

export default function NoteForm() {
  return (
    <form action="/api/reflect/notes/create" method="post">
      <input type="hidden" name="graphId" value="your-graph-id" />
      <input type="text" name="subject" required placeholder="Note subject" />
      <textarea name="content_markdown" required placeholder="Note content (Markdown)"></textarea>
      <label>
        <input type="checkbox" name="pinned" value="true" />
        Pin this note
      </label>
      <button type="submit">Create Note</button>
    </form>
  );
}

export const action = async (props: {
  graphId: string;
  subject: string;
  content_markdown: string;
  pinned?: boolean;
}, req: Request, ctx: AppContext) => {
  return await ctx.reflect.actions["notes/create"](props);
};
```

## Note on End-to-End Encryption

Reflect notes are end-to-end encrypted. The Reflect API is append-only for note-related endpoints because the servers can't read the contents of your notes. Keep this in mind when using this app. 