# Slack OAuth App

A Deco app for integrating with Slack using OAuth 2.0 authentication. This app allows you to send messages, interact with channels, and manage Slack workspaces through a secure OAuth flow with flexible bot configuration options, including **channel-specific bot routing**.

## Features

- 🔐 **OAuth 2.0 Authentication** - Secure token-based authentication
- 🤖 **Flexible Bot Configuration** - Choose between deco.chat bot or custom Slack apps
- 🎯 **Channel-Specific Bot Routing** - Configure different bots for different channels independently
- 💬 **Message Management** - Send messages and replies to channels
- 📋 **Channel Operations** - List and interact with workspace channels
- 👥 **User Management** - Get user information and profiles
- 🎯 **Reactions** - Add emoji reactions to messages
- 📁 **File Upload V2** - Upload files using the new Slack API (files.upload sunset Nov 12, 2025)
- 🔄 **Automatic Token Refresh** - Handles token expiration automatically
- 🎨 **Custom Bot Selection UI** - Interactive interface for choosing integration type

## Channel-Specific Bot Routing

### Overview

The app now supports **channel-specific bot routing**, allowing you to configure different bot personalities, names, and configurations for each channel independently. This enables:

- 🎯 **Per-channel bot customization** - Different bot names and settings for each channel
- 🏢 **Multi-team support** - Use different OAuth credentials for different channels
- 🎨 **Brand consistency** - Customize bot appearance per channel or use case
- 🔄 **Easy management** - Set, update, and remove channel configurations via API
- 📊 **Configuration overview** - List and compare bot configurations across channels

### How It Works

The system uses a **routing architecture** where:

1. **Default Bot Configuration**: A fallback configuration used for all channels without specific settings
2. **Channel-Specific Configurations**: Custom bot settings that override the default for specific channels
3. **Dynamic Resolution**: When performing actions, the system automatically selects the appropriate bot configuration for each channel

### Configuration Structure

Each bot configuration includes:

```typescript
interface ChannelBotConfig {
  id: string;              // Unique identifier
  channelId: string;       // Channel this applies to ("*" for default)
  botName: string;         // Bot name (e.g., "support-bot", "sales-assistant")
  displayName?: string;    // Display name shown to users
  avatar?: string;         // Bot avatar URL or emoji
  description?: string;    // Bot description
  botToken?: string;       // Custom bot token (optional)
  clientId?: string;       // Custom OAuth client ID (optional)
  clientSecret?: string;   // Custom OAuth client secret (optional)
  isActive: boolean;       // Whether this configuration is active
  createdAt: string;       // Creation timestamp
  updatedAt: string;       // Last update timestamp
  metadata?: Record<string, unknown>; // Additional custom data
}
```

## Integration Options

### 1. deco.chat Bot (Recommended)

Use the official deco.chat bot for seamless integration:

- ✅ **Pre-configured** - All necessary permissions included
- ✅ **Zero setup** - No Slack app creation required
- ✅ **Maintained by Deco** - Automatic updates and security patches
- ✅ **Best for most users** - Quick setup and reliable operation

### 2. Custom Bot

Configure your own Slack app for advanced use cases:

- 🎯 **Full control** - Use your own Slack app credentials
- 🎨 **Custom branding** - Customize bot name and appearance
- 🔒 **Enterprise ready** - Full control over permissions and scopes
- 🏢 **Private deployments** - Use your own Slack app infrastructure

## ⚠️ IMPORTANT: File Upload API Migration

**The Slack `files.upload` API will be sunset on November 12, 2025.** This app now includes:

- ✅ **New V2 Upload API** - Using `files.getUploadURLExternal` + `files.completeUploadExternal`
- ⚠️ **Legacy API Support** - With deprecation warnings (will be removed)
- 📖 **Migration Guide** - See [UPLOAD_MIGRATION.md](./UPLOAD_MIGRATION.md) for details

**Action Required**: Update your file upload code to use `uploadFileV2()` method before November 12, 2025.

## Setup Instructions

### Option 1: Using deco.chat Bot (Recommended)

1. **Start OAuth Flow** - No preliminary setup needed
2. **Select Integration Type** - Choose "deco.chat Bot" in the selection interface
3. **Authorize** - Complete OAuth authorization in your Slack workspace
4. **Ready to use** - Integration is immediately available

### Option 2: Setting Up Custom Bot

#### Step 1: Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter your app name and select a workspace
4. Navigate to "OAuth & Permissions" in the sidebar

#### Step 2: Configure OAuth Settings

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

#### Step 3: Use Custom Bot in OAuth Flow

1. **Start OAuth Flow** - Begin the standard OAuth process
2. **Select Integration Type** - Choose "Custom Bot" in the selection interface
3. **Enter Credentials**:
   - **Client ID**: Your Slack app's Client ID
   - **Client Secret**: Your Slack app's Client Secret
   - **Bot Name** (optional): Custom identifier for your bot
4. **Complete Authorization** - Finish OAuth flow with your custom app

## Bot Selection Interface

The app now features an interactive selection interface that appears during OAuth flow:

### Selection Options

- **deco.chat Bot**: Official bot with pre-configured settings
- **Custom Bot**: Your own Slack app with custom configuration

### Custom Bot Configuration

When selecting "Custom Bot", the integration follows a secure credential flow:

1. **Client-Side**: User enters credentials in the selection interface
2. **Secure Storage**: Credentials are sent via POST to `/slack/actions/oauth/store-credentials`
3. **Token Generation**: Server generates a secure, time-limited token
4. **OAuth Flow**: Token is used in URL instead of raw credentials
5. **Credential Retrieval**: Server retrieves credentials server-side using the token

**Security Features:**
- ✅ **No credential exposure** in URL parameters, logs, or browser history
- ✅ **Time-limited tokens** (10-minute expiration)
- ✅ **Tokens are cleared after the OAuth callback invalidates the session or when the 10-minute window elapses**
- ✅ **HTTPS enforcement** for credential transmission
- ✅ **Automatic cleanup** of expired tokens

**Required Credentials:**
- **Client ID** (required): From your Slack app's "Basic Information" page
- **Client Secret** (required): From your Slack app's "Basic Information" page
- **Bot Name** (optional): Custom identifier for branding purposes

### Interface Features

- 🎨 **Dark/Light theme** toggle
- 📱 **Responsive design** for mobile and desktop
- ✨ **Interactive selection** with visual feedback
- 🔒 **Secure credential handling** with masked secrets

## OAuth Flow

The app provides these endpoints for OAuth:

- **Start OAuth**: `/loaders/oauth/start` - Shows selection interface or redirects to Slack
- **OAuth Callback**: `/actions/oauth/callback` - Handles authorization response and token exchange

### Flow Diagram

```text
User → Start OAuth → Selection UI → [Choose Option] → Slack Authorization → Callback → Complete
                        ↓                    ↓
                  [deco.chat bot]    [Custom bot + credentials]
```

## Environment Variables

For custom bot configurations, you may optionally set:

```bash
SLACK_CLIENT_ID=your_slack_client_id      # Optional: Default custom bot
SLACK_CLIENT_SECRET=your_slack_client_secret  # Optional: Default custom bot
```

## API Methods

### Bot Configuration Management

#### Set Channel Bot Configuration
```typescript
// Configure a bot for a specific channel
await ctx.invoke("slack/actions/bot-routing/set-config", {
  channelId: "C1234567890",
  botName: "support-bot",
  displayName: "Customer Support Assistant",
  avatar: "🛠️",
  description: "I help with customer support inquiries",
  isActive: true,
  forceUpdate: false // Set to true to override existing configuration
});
```

#### Remove Channel Bot Configuration
```typescript
// Remove channel-specific configuration (reverts to default bot)
await ctx.invoke("slack/actions/bot-routing/remove-config", {
  channelId: "C1234567890"
});
```

#### Update Default Bot Configuration
```typescript
// Update the default bot configuration
await ctx.invoke("slack/actions/bot-routing/set-default", {
  botName: "deco-assistant",
  displayName: "Deco AI Assistant",
  description: "Your friendly AI assistant"
});
```

#### List Bot Configurations
```typescript
// List all bot configurations
const configs = await ctx.invoke("slack/loaders/bot-routing/list", {
  includeInactive: false // Set to true to include inactive configurations
});
```

#### Get Channel Bot Configuration
```typescript
// Get the resolved bot configuration for a specific channel
const channelConfig = await ctx.invoke("slack/loaders/bot-routing/get-config", {
  channelId: "C1234567890"
});
```

#### Compare Channel Configurations
```typescript
// Compare configurations across multiple channels
const comparison = await ctx.invoke("slack/loaders/bot-routing/compare", {
  channelIds: ["C1234567890", "C0987654321", "C1122334455"]
});
```

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

## Custom Bot Configuration Details

### Bot Name Usage

The bot name is used in:
- Channel welcome messages: `"To interact with me, just mention @your-bot-name in your messages!"`
- Channel listings: Shows `@your-bot-name` instead of `@deco.chat`
- App configuration: Stored as `customBotName` for future reference

### Bot Name Preservation

During re-authentication or token refresh:
- **With botName parameter**: Updates to the new custom name
- **Without botName parameter**: Preserves the existing custom bot name
- **First install**: Uses "deco.chat" as default if no botName provided

### Multiple Bot Support

The system supports multiple custom bots by:
- Storing bot-specific information in app configuration
- Dynamic bot name resolution in channel operations
- Preserving custom bot names across re-authentications

## Channel Bot Routing Examples

### Example 1: Customer Support vs Sales Channels

```typescript
// Configure a support bot for customer service channels
await ctx.invoke("slack/actions/bot-routing/set-config", {
  channelId: "C1234567890", // #customer-support
  botName: "support-assistant",
  displayName: "Support Assistant",
  avatar: "🛠️",
  description: "I help resolve customer issues and questions",
});

// Configure a sales bot for sales channels
await ctx.invoke("slack/actions/bot-routing/set-config", {
  channelId: "C0987654321", // #sales-team
  botName: "sales-bot",
  displayName: "Sales Assistant",
  avatar: "💼",
  description: "I help with sales inquiries and lead management",
});
```

### Example 2: Multi-Organization Setup

```typescript
// Use different OAuth credentials for different client channels
await ctx.invoke("slack/actions/bot-routing/set-config", {
  channelId: "C1111111111", // #client-a-project
  botName: "client-a-bot",
  displayName: "Client A Assistant",
  clientId: "client-a-slack-app-id",
  clientSecret: "client-a-slack-app-secret",
  botToken: "xoxb-client-a-token",
});

await ctx.invoke("slack/actions/bot-routing/set-config", {
  channelId: "C2222222222", // #client-b-project
  botName: "client-b-bot",
  displayName: "Client B Assistant",
  clientId: "client-b-slack-app-id",
  clientSecret: "client-b-slack-app-secret",
  botToken: "xoxb-client-b-token",
});
```

### Example 3: Department-Specific Bots

```typescript
// Engineering team bot
await ctx.invoke("slack/actions/bot-routing/set-config", {
  channelId: "C3333333333", // #engineering
  botName: "dev-bot",
  displayName: "DevOps Assistant",
  avatar: "⚙️",
  description: "I help with development and deployment tasks",
  metadata: {
    department: "engineering",
    specialization: "devops"
  }
});

// Marketing team bot
await ctx.invoke("slack/actions/bot-routing/set-config", {
  channelId: "C4444444444", // #marketing
  botName: "marketing-bot",
  displayName: "Marketing Assistant",
  avatar: "📈",
  description: "I help with campaigns and analytics",
  metadata: {
    department: "marketing",
    specialization: "campaigns"
  }
});
```

### Example 4: Automatic Bot Resolution

When you send messages, the system automatically uses the correct bot configuration:

```typescript
// This will use the support-assistant bot configuration
await ctx.invoke("slack/actions/messages/post", {
  channelId: "C1234567890", // #customer-support
  text: "Hello! How can I help you today?"
});

// This will use the sales-bot configuration
await ctx.invoke("slack/actions/messages/post", {
  channelId: "C0987654321", // #sales-team
  text: "New lead available for review!"
});

// This will use the default bot configuration
await ctx.invoke("slack/actions/messages/post", {
  channelId: "C5555555555", // #general (no specific configuration)
  text: "General announcement"
});
```

## Migration from Single Bot Configuration

If you're upgrading from a previous version that only supported a single bot configuration:

If you're upgrading from a previous version that only supported a single bot configuration:

1. **Automatic Migration**: Your existing configuration becomes the default bot configuration
2. **Backward Compatibility**: All existing functionality continues to work unchanged
3. **Gradual Adoption**: You can add channel-specific configurations incrementally
4. **Legacy Support**: The `customBotName` prop is still supported and updates the default bot

### Migration Steps

1. **Current setup continues to work** - No immediate changes required
2. **Review your current configuration**:
   ```typescript
   const configs = await ctx.invoke("slack/loaders/bot-routing/list");
   console.log("Default bot:", configs.defaultBot);
   ```
3. **Add channel-specific configurations as needed**:
   ```typescript
   await ctx.invoke("slack/actions/bot-routing/set-config", {
     channelId: "C1234567890",
     botName: "specialized-bot",
     // ... other configuration
   });
   ```

## Migration from Bot Token

1. The app maintains backward compatibility with `botToken` prop
2. OAuth tokens take precedence over bot tokens when both are present
3. Update your app configuration to use OAuth instead of direct bot tokens
4. The `teamId` is now automatically obtained during OAuth flow
5. Custom bot information is preserved across OAuth flows

## Security

- 🔒 Tokens are stored securely in the app configuration
- 🔄 Automatic token refresh prevents expired token issues
- 🛡️ OAuth scopes limit app permissions to only what's needed
- 🌐 HTTPS is required for redirect URLs in production
- 🔐 Client secrets are handled securely and never exposed in frontend

## Troubleshooting

## Troubleshooting

### Bot Routing Issues

1. **Wrong bot responding in channel**:
   ```typescript
   // Check which bot configuration is resolved for a channel
   const resolved = await ctx.invoke("slack/loaders/bot-routing/get-config", {
     channelId: "C1234567890"
   });
   console.log("Resolved config:", resolved);
   ```

2. **Bot configuration not taking effect**:
   - Verify the configuration is active: `isActive: true`
   - Check for typos in the channel ID
   - Ensure the bot has proper permissions in the channel

3. **Default bot not working**:
   ```typescript
   // Check default bot configuration
   const configs = await ctx.invoke("slack/loaders/bot-routing/list");
   console.log("Default bot config:", configs.defaultBot);
   ```

4. **Multiple bots with same name**:
   ```typescript
   // Compare configurations across channels
   const comparison = await ctx.invoke("slack/loaders/bot-routing/compare", {
     channelIds: ["C1234567890", "C0987654321"]
   });
   ```

### Selection Interface Issues

1. **Selection page not showing**: Ensure OAuth start URL doesn't include bot type parameters
2. **Custom credentials not working**: Verify Client ID and Secret are correct
3. **Theme not persisting**: Check browser localStorage support

### Common OAuth Issues

1. **"Team ID is required" error**: Ensure OAuth flow completed successfully and `teamId` is set
2. **"Invalid redirect URI" error**: Check that redirect URL matches exactly in Slack app settings
3. **"Invalid scope" error**: Verify all required scopes are added to your Slack app
4. **Token refresh failures**: Check that `client_secret` is correctly configured

### Custom Bot Issues

1. **Invalid Client Credentials**: Ensure your Client ID and Client Secret are correct
2. **Insufficient Permissions**: Make sure your Slack app has all required OAuth scopes
3. **Redirect URI Mismatch**: Verify the redirect URI in your Slack app settings matches

### Debug Mode

Enable debug logging by checking the browser developer tools or server logs for OAuth-related errors.

## Development

The app uses the MCP (Multi-Channel Platform) OAuth utilities for token management and HTTP client creation. The main components are:

- `mod.ts` - Main app configuration with OAuth setup and bot routing
- `client.ts` - Slack API client with OAuth support
- `types/bot-routing.ts` - TypeScript interfaces for bot routing system
- `utils/bot-router.ts` - Core bot routing logic and configuration management
- `utils/constants.ts` - OAuth URLs and scopes
- `utils/client.ts` - TypeScript interfaces for API endpoints
- `utils/state-helpers.ts` - Secure session token management
- `utils/ui-templates/page-generator.ts` - Clean bot selection interface generator
- `loaders/oauth/start.ts` - OAuth initiation with bot selection logic
- `loaders/bot-routing/` - Loaders for bot configuration management
- `actions/oauth/callback.ts` - OAuth completion with custom bot support
- `actions/bot-routing/` - Actions for managing channel-specific bot configurations

### Key Architecture Changes

1. **Bot Router System**: Central routing system that resolves bot configurations per channel
2. **Dynamic Client Creation**: `slackClientForChannel()` method creates Slack clients with channel-specific configurations
3. **Configuration Persistence**: Bot routing configurations are stored in the app's configuration state
4. **Backward Compatibility**: Existing single-bot setups continue to work as default configurations

## Contributing

When contributing to this app:

1. Test both single bot and multi-bot routing scenarios
2. Test both deco.chat bot and custom bot flows
3. Ensure bot routing works correctly for different channels
4. Verify configuration persistence across app restarts
5. Test the selection interface works on both light and dark themes
6. Verify mobile responsiveness of the selection page
7. Test credential validation and error handling
8. Test bot configuration management actions and loaders
9. Maintain backward compatibility with existing bot token approach
