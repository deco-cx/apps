# GitHub App

A Deco app that provides strongly typed interactions with the GitHub APIs. This app enables seamless integration with GitHub's features through a type-safe interface.

## Features

- **Type-Safe API Integration**: All GitHub API responses are strongly typed for better development experience
- **Authentication Support**: Built-in OAuth support for GitHub authentication
- **Core GitHub Operations**:
  - User authentication and profile management
  - Repository operations
  - Gist management
  - File content retrieval

## Structure

```
github/
├── actions/         # Action handlers for GitHub operations
│   ├── createGist.ts
│   └── oauth/       # OAuth-related actions
├── loaders/         # Data loading functions
│   ├── getAuthenticatedUser.ts
│   ├── getRepoFileContent.ts
│   ├── listAuthenticatedUserRepos.ts
│   ├── listPublicGists.ts
│   └── oauth/       # OAuth-related loaders
├── utils/          # Utility functions and constants
├── manifest.gen.ts # Generated manifest file
└── mod.ts         # Main application module
```

## Available Operations

### User Operations
- Get authenticated user information
- List authenticated user's repositories

### Repository Operations
- Get repository file content
- List public repositories

### Gist Operations
- Create new gists
- List public gists

## Authentication

The app supports GitHub OAuth authentication. Make sure to:
1. Configure your GitHub OAuth application
2. Set up the required scopes for your use case
3. Provide the access token when initializing the app

## Development

This app is built using Deco's framework and provides a type-safe way to interact with GitHub's APIs. All API responses are properly typed, making it easier to work with GitHub's data structures.
