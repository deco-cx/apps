# Slack OAuth App

A Deco app for integrating with Slack using OAuth 2.0 authentication. This app allows you to send messages, interact with channels, and manage Slack workspaces through a secure OAuth flow.

## Features

- 🔐 **OAuth 2.0 Authentication** - Secure token-based authentication
- 🤖 **Custom Bot Support** - Support for private/custom Slack apps instead of just deco.chat
- 💬 **Message Management** - Send messages and replies to channels
- 📋 **Channel Operations** - List and interact with workspace channels
- 👥 **User Management** - Get user information and profiles
- 🎯 **Reactions** - Add emoji reactions to messages
- 📁 **File Upload V2** - Upload files using the new Slack API (files.upload sunset Nov 12, 2025)
- 🔄 **Automatic Token Refresh** - Handles token expiration automatically

## ⚠️ IMPORTANT: File Upload API Migration

**The Slack `files.upload` API will be sunset on November 12, 2025.** This app now includes:

- ✅ **New V2 Upload API** - Using `files.getUploadURLExternal` + `files.completeUploadExternal`
- ⚠️ **Legacy API Support** - With deprecation warnings (will be removed)
- 📖 **Migration Guide** - See [UPLOAD_MIGRATION.md](./UPLOAD_MIGRATION.md) for details

**Action Required**: Update your file upload code to use `uploadFileV2()` method before November 12, 2025.

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

#### Custom Bot Configuration

The app supports custom/private Slack bots. You can configure:

- **Bot Name**: Set a custom identifier for your bot (used in channel messages)

**Example OAuth Start with Custom Bot:**
```typescript
// Start OAuth with custom bot configuration
const startProps = {
  clientId: "your_custom_bot_client_id",
  redirectUri: "https://your-domain.com/oauth/callback",
  state: "your_state_parameter",
  botName: "my-custom-bot" // Custom bot name
};
```

The app uses the standard set of scopes defined in `SCOPES` for all bots, ensuring consistent functionality across different bot configurations.

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

### File Upload
- `uploadFileV2(options)` - Upload files using new V2 API (recommended)
- `uploadFile(options)` - Upload files using legacy API (deprecated, shows warning)

**New V2 Upload Example:**
```typescript
const response = await slack.uploadFileV2({
  channels: "C1234567890", // Optional
  file: fileBlob, // Supports Uint8Array, Blob, File, base64, data URL
  filename: "document.pdf",
  title: "Important Document",
  thread_ts: "1234567890.123456", // Optional - upload to thread
  initial_comment: "Here's the document"
});
```

## Custom Bot Configuration

### Setting Up a Custom Bot

1. **Create Your Custom Slack App** following steps 1-3 above
2. **Use Custom Scopes** - Choose appropriate scopes for your bot's functionality
3. **Configure Bot Name** - Set a unique identifier for your bot

### Bot Name Usage

The bot name is used in:
- Channel welcome messages: `"To interact with me, just mention @your-bot-name in your messages!"`
- Channel listings: Shows `@your-bot-name` instead of `@deco.chat`
- App configuration: Stored as `customBotName` for future reference

### Multiple Bot Support

The system now supports multiple custom bots by:
- Storing bot-specific information in app configuration
- Dynamic bot name resolution in channel operations
- Custom scope management per bot

## Migration from Bot Token

If you're migrating from the previous bot token approach:

1. The app maintains backward compatibility with `botToken` prop
2. OAuth tokens take precedence over bot tokens when both are present
3. Update your app configuration to use OAuth instead of direct bot tokens
4. The `teamId` is now automatically obtained during OAuth flow
5. **New**: Custom bot information is preserved across OAuth flows

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
