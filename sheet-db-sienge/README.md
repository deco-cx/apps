# SheetDB Sienge App

This app provides a wrapper for the SheetDB API to access Sienge data. It allows you to retrieve and manage data stored in Google Sheets through the SheetDB service.

## Setup

1. Create a SheetDB API endpoint for your Google Sheet at [sheetdb.io](https://sheetdb.io/)
2. Install this app in your deco project
3. Configure the app with your SheetDB API ID

## Available Functionality

### Loaders

- **getData**: Fetch data from the sheet with filtering and sorting options
- **getKeys**: Get all column names from the sheet
- **getDocumentName**: Get the document name
- **getCount**: Get the number of rows in the document

### Actions

- **createRow**: Add one or more rows to the sheet

## Example Usage

```ts
// Example: Get all data from the sheet
const sheetData = await loaders.sheetDBSienge.getData({
  sort_by: "Código",
  sort_order: "asc",
  limit: 10
});

// Example: Add a new row to the sheet
const result = await actions.sheetDBSienge.createRow({
  data: {
    "Código": "4689",
    "Descrição": "DISJUNTOR TRIFÁSICO 30 A",
    "Quantidade": "2",
    "Unidade": "un",
    "Data Cotação": "20/05/2025",
    "Fornecedor": "SUPPLIER EXAMPLE",
    "Data Entrega": "25/05/2025",
    "IPI (%)": "",
    "Subtotal": "",
    "Data de Entrega": "25/05/2025"
  }
});
``` 