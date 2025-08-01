# Notion MCP

A Deco app that provides Model Context Protocol (MCP) server functionality for Notion, enabling AI assistants to interact with your Notion workspace.

## Features

### Loaders (Data Retrieval)

- **Get Page**: Retrieve a specific Notion page by ID
- **Get Database**: Retrieve a specific Notion database by ID
- **Query Database**: Query a database with filters, sorting, and pagination
- **Get Block Children**: Get child blocks of a specific block
- **Search Pages**: Search for pages and databases in your workspace
- **Get Users**: List all users in the workspace

### Actions (Data Modification)

- **Create Page**: Create new pages in databases or as child pages
- **Update Page**: Update page properties, icon, cover, and archive status
- **Create Database**: Create new databases with custom properties
- **Update Database**: Update database properties, title, and description
- **Append Block Children**: Add child blocks to existing blocks
- **Create Comment**: Add comments to pages or blocks

## MCP Setup

This app works as an MCP (Model Context Protocol) server. Follow these steps:

### 1. Get Your Notion Integration Token

1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Name it (e.g., "My MCP Integration")
4. Select your workspace
5. Click **Submit**
6. Go to **Configuration** tab
7. Click **"Show"** next to "Internal Integration Secret"
8. Copy the token (starts with `ntn_` or `secret_`)

### 2. Share Pages with Integration

For each Notion page/database you want to access:

1. Open the page in Notion
2. Click **"Share"** in the top-right
3. In the "Invite" field, type your integration name
4. Select it and click **"Invite"**

### 3. Configure MCP

When setting up the MCP:

- **Use your Notion integration token** (not the generated MCP token)
- The token should be your actual Notion token: `ntn_123456789...`
- This allows the MCP to access your Notion workspace directly

## Quick Test

1. **Test Search** (easiest first test):

   - Use "Search Notion Pages" loader
   - Leave all fields empty to get all your pages
   - Or add a search query to find specific content

2. **Test Create Page**:
   - Use "Create Notion Page" action
   - Add a page title (required)
   - Either provide a `parent_database_id` OR `parent_page_id`
   - Optionally add an emoji icon (e.g., 📝)

## Troubleshooting

### "API token is invalid" Error

- Make sure you're using your **Notion integration token**, not the MCP generated token
- Verify the token is complete (usually 50 characters long)
- Ensure you've shared your pages/databases with the integration

### "Invalid request URL" Error

- This usually indicates an endpoint configuration issue
- Try regenerating the MCP configuration

## Usage

This app exposes Notion's API as MCP tools that can be used by AI assistants to:

- Create and manage pages and databases
- Query and search your Notion content
- Add comments and collaborate
- Organize content with blocks and properties

### Common Use Cases

- **Content Management**: Create and update pages automatically
- **Data Sync**: Query databases and sync with other tools
- **Knowledge Base**: Search and organize company documentation
- **Task Management**: Create and track tasks in Notion databases

## API Reference

Based on the [Notion API v2022-06-28](https://developers.notion.com/reference/intro).
