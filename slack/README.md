# Slack OAuth App

A Deco app for integrating with Slack using OAuth 2.0 authentication. This app allows you to send messages, interact with channels, and manage Slack workspaces through a secure OAuth flow.

## Features

- 🔐 **OAuth 2.0 Authentication** - Secure token-based authentication
- 💬 **Message Management** - Send messages and replies to channels
- 📋 **Channel Operations** - List and interact with workspace channels
- 👥 **User Management** - Get user information and profiles
- 🎯 **Reactions** - Add emoji reactions to messages
- 🔄 **Automatic Token Refresh** - Handles token expiration automatically

## Setup Instructions

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter your app name and select a workspace
4. Navigate to "OAuth & Permissions" in the sidebar

### 2. Configure OAuth Settings

1. Add your redirect URL under "Redirect URLs":
   - Development: `https://your-dev-domain.com/oauth/callback`
   - Production: `https://your-prod-domain.com/oauth/callback`

2. Add the following OAuth scopes under "Bot Token Scopes":
   - `channels:read` - View basic information about public channels
   - `chat:write` - Send messages as the app
   - `reactions:write` - Add and edit emoji reactions
   - `channels:history` - View messages and content in public channels
   - `users:read` - View people in the workspace
   - `users:read.email` - View email addresses of people in the workspace

### 3. Environment Variables

Set the following environment variables:

```bash
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
```

You can find these values in your Slack app's "Basic Information" page under "App Credentials".

### 4. OAuth Flow

The app provides two endpoints for OAuth:

- **Start OAuth**: `/loaders/oauth/start` - Redirects users to Slack for authorization
- **OAuth Callback**: `/actions/oauth/callback` - Handles the authorization response

### 5. Usage

After OAuth setup, the app will automatically:
- Exchange authorization codes for access tokens
- Store tokens securely in the app configuration
- Refresh tokens automatically when they expire
- Provide a `SlackClient` instance for API operations

## API Methods

### Channels
- `getChannels(teamId, limit?, cursor?)` - List workspace channels
- `getChannelHistory(channelId, limit?)` - Get channel message history

### Messages
- `postMessage(channelId, text)` - Send a message to a channel
- `postReply(channelId, threadTs, text)` - Reply to a thread
- `getThreadReplies(channelId, threadTs)` - Get thread replies

### Users
- `getUsers(teamId, limit?, cursor?)` - List workspace users
- `getUserProfile(userId)` - Get user profile information

### Reactions
- `addReaction(channelId, timestamp, reaction)` - Add emoji reaction

## Migration from Bot Token

If you're migrating from the previous bot token approach:

1. The app maintains backward compatibility with `botToken` prop
2. OAuth tokens take precedence over bot tokens when both are present
3. Update your app configuration to use OAuth instead of direct bot tokens
4. The `teamId` is now automatically obtained during OAuth flow

## Security

- Tokens are stored securely in the app configuration
- Automatic token refresh prevents expired token issues
- OAuth scopes limit app permissions to only what's needed
- HTTPS is required for redirect URLs in production

## Troubleshooting

### Common Issues

1. **"Team ID is required" error**: Ensure OAuth flow completed successfully and `teamId` is set
2. **"Invalid redirect URI" error**: Check that redirect URL matches exactly in Slack app settings
3. **"Invalid scope" error**: Verify all required scopes are added to your Slack app
4. **Token refresh failures**: Check that `client_secret` is correctly configured

### Debug Mode

Enable debug logging by checking the browser developer tools or server logs for OAuth-related errors.

## Development

The app uses the MCP (Multi-Channel Platform) OAuth utilities for token management and HTTP client creation. The main components are:

- `mod.ts` - Main app configuration with OAuth setup
- `client.ts` - Slack API client with OAuth support
- `utils/constants.ts` - OAuth URLs and scopes
- `utils/client.ts` - TypeScript interfaces for API endpoints
- `loaders/oauth/start.ts` - OAuth initiation
- `actions/oauth/callback.ts` - OAuth completion
