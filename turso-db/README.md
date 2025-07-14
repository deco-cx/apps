# Turso DB App for Deco

A Deco app for interacting with [Turso](https://turso.tech/) SQLite databases via HTTP API.

## Installation

To use this app, add the following import to your `deco.ts` file:

```ts
import tursoDb from "turso-db/mod.ts";
```

Then instantiate it with:

```ts
export default {
  apps: {
    // Other apps...
    "turso-db": tursoDb({
      databaseUrl: "https://your-database-org.turso.io",
      token: "your-auth-token"
    }),
  },
};
```

## Usage

### Running SQL Queries

Use the `runQuery` action to execute any SQL query against your Turso database:

```tsx
import { useSignal } from "@preact/signals";
import { useCallback } from "preact/hooks";
import type { Result } from "turso-db/actions/runQuery.ts";

export default function MyComponent() {
  const queryResult = useSignal<Result | null>(null);
  
  const handleQuery = useCallback(async () => {
    // SELECT query example
    const result = await runQuery({
      sql: "SELECT * FROM users WHERE age > ?",
      params: [{
        type: "integer",
        value: 21
      }]
    });
    
    queryResult.value = result;
  }, []);
  
  // For INSERT/UPDATE operations
  const handleInsert = useCallback(async () => {
    const result = await runQuery({
      sql: "INSERT INTO users (name, email) VALUES (?, ?)",
      params: [
        {
          type: "text",
          value: "John Doe"
        },
        {
          type: "text",
          value: "john@example.com"
        }
      ]
    });
    
    console.log(`Rows affected: ${result.affected_row_count}`);
    console.log(`Last insert ID: ${result.last_insert_rowid}`);
  }, []);
  
  return (
    <div>
      <button onClick={handleQuery}>Run Query</button>
      <button onClick={handleInsert}>Insert Data</button>
      
      {queryResult.value?.rows && (
        <table>
          <thead>
            <tr>
              {queryResult.value.columns?.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {queryResult.value.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{String(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {queryResult.value?.error && (
        <div className="error">
          Error: {queryResult.value.error.message}
        </div>
      )}
    </div>
  );
}
```

## Documentation

For more information about Turso's HTTP API, refer to the [official documentation](https://docs.turso.tech/api/http). 