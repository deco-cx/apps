export interface AirtableBase {
  id: string;
  name: string;
  recordCount?: number;
}

export interface AirtableTable {
  id: string;
  name: string;
  recordCount?: number;
  baseId?: string;
}

export interface SelectionPageOptions {
  bases: AirtableBase[];
  tables: AirtableTable[];
  callbackUrl: string;
}

export function generateSelectionPage(
  { bases, tables, callbackUrl }: SelectionPageOptions,
): string {
  const templatePath = new URL(
    "./selection-page.template.html",
    import.meta.url,
  );

  let htmlTemplate: string;
  try {
    htmlTemplate = Deno.readTextFileSync(templatePath);
  } catch (error) {
    console.error("Failed to read HTML template:", error);
    return generateFallbackPage({ bases, tables, callbackUrl });
  }

  const processedHtml = htmlTemplate
    .replace('"{{BASES_DATA}}"', JSON.stringify(bases))
    .replace('"{{TABLES_DATA}}"', JSON.stringify(tables))
    .replace('"{{CALLBACK_URL}}"', JSON.stringify(callbackUrl));

  return processedHtml;
}

function generateFallbackPage(
  { bases, tables, callbackUrl }: SelectionPageOptions,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MCP Connector - Airtable Access</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      max-width: 32rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      padding: 24px;
      text-align: center;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      font-size: 14px;
      margin: 8px;
      border: 1px solid transparent;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }
    .btn-secondary {
      background: white;
      color: #374151;
      border-color: #d1d5db;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>MCP Connector - Airtable Access</h2>
    <p>Template file not found. Using fallback interface.</p>
    <p>Found ${bases.length} bases and ${tables.length} tables.</p>
    <div>
      <button class="btn btn-secondary" onclick="window.location.href='${callbackUrl}&skip=true'">
        Skip selection
      </button>
      <button class="btn btn-primary" onclick="window.location.href='${callbackUrl}&isSaveBase=true'">
        Continue
      </button>
    </div>
  </div>
</body>
</html>`;
}
