# App Template

## NOTICE

this is heavily inspired on <https://github.com/modelcontextprotocol/servers/tree/main/src/slack> under MIT License.

## Setup

### 1. Create a Slack App

1. Visit the [Slack Apps page](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Name your app and select your workspace

### 2. Configure Bot Token Scopes

Navigate to "OAuth & Permissions" and add these scopes:

- `channels:history` - View messages and other content in public channels
- `channels:read` - View basic channel information
- `chat:write` - Send messages as the app
- `reactions:write` - Add emoji reactions to messages
- `users:read` - View users and their basic information

### 3. Install App to Workspace

1. Click "Install to Workspace" and authorize the app
2. Save the "Bot User OAuth Token" that starts with `xoxb-`
3. Get your Team ID (starts with a `T`) by following [this guidance](https://slack.com/intl/pt-br/help/articles/221769328-Localizar-URL-ou-ID-do-Slack#find-your-workspace-or-org-id)
