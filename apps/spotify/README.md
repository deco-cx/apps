# Spotify App

This app provides integration with the Spotify Web API, allowing you to manage playlists, control playback, and access user data.

## Features

- **User Management**: Get current user profile and information
- **Playlist Management**: Add tracks to playlists
- **Playback Control**: Start/resume playback on available devices
- **Library Management**: Save albums to user's library
- **Device Management**: Get available Spotify devices

## Configuration

To use this app, you'll need to set up a Spotify application and obtain the necessary credentials:

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new application
3. Get your Client ID and Client Secret
4. Configure the app with the following settings:
   - **Client ID**: Your Spotify application's client ID
   - **Client Secret**: Your Spotify application's client secret
   - **Access Token**: A valid Spotify access token with the required scopes

## Required Scopes

The app requires the following Spotify scopes:
- `user-read-private` - Read user profile data
- `user-read-email` - Read user email address
- `playlist-modify-public` - Modify public playlists
- `playlist-modify-private` - Modify private playlists
- `user-library-modify` - Modify user's library
- `user-read-playback-state` - Read playback state
- `user-modify-playback-state` - Control playback
- `user-read-currently-playing` - Read currently playing track

## Loaders

- **Get Current User**: Retrieves the current user's profile information
- **Get Available Devices**: Lists all available Spotify devices
- **Who Am I**: OAuth endpoint to get user information

## Actions

- **Add Tracks to Playlist**: Adds tracks to a specified playlist
- **Save Albums to Library**: Saves albums to the user's library
- **Start/Resume Playback**: Controls playback on Spotify devices

## Example Usage

After configuring the app with your Spotify credentials, you can use the loaders and actions in your deco site to integrate Spotify functionality.