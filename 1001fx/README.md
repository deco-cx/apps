# 1001fx MCP

This app integrates with the 1001fx API to provide media processing capabilities for your applications.

## Features

### Audio2Video

Converts an MP3 audio file into an MP4 video file with images displayed for specified durations. The result is a URL to the MP4 file that is available for 48 hours.

#### Parameters

- `url` (string, required): The URL of the audio file (MP3).
- `images` (array, optional): Array of images to show in your video. Each object contains:
  - `imageUrl` (string, required): The URL of an image to show in your video.
  - `duration` (number, required): The number of seconds this image should be shown.
- `thumbnailImageUrl` (string, optional): The URL of the thumbnail image.
- `videoResolution` (object, optional): The resolution of the output video.
  - `width` (number): Width in pixels (default: 1280).
  - `height` (number): Height in pixels (default: 720).
- `presignedUrl` (string, optional): When provided, the video URL will be uploaded to this URL rather than returned directly.

#### Example

```typescript
// Basic usage with just audio URL and thumbnail
const result1 = await client.action("1001fx/actions/audio2video", {
  url: "https://api.1001fx.com/testdata/jingle.mp3",
  thumbnailImageUrl: "https://api.1001fx.com/testdata/image.jpg"
});

// Advanced usage with images and video resolution
const result2 = await client.action("1001fx/actions/audio2video", {
  url: "https://api.1001fx.com/testdata/jingle.mp3",
  images: [
    {
      imageUrl: "https://example.com/image1.jpg",
      duration: 2
    },
    {
      imageUrl: "https://example.com/image2.jpg",
      duration: 3
    }
  ],
  thumbnailImageUrl: "https://example.com/thumbnail.jpg",
  videoResolution: {
    width: 1280,
    height: 720
  }
});

// Result: { url: "https://cdn.1001fx.com/output/video123.mp4", statusCode: 200 }
```

## Installation

To use this app, you need to provide your 1001fx API key when installing the app.

```typescript
import { createClient } from "deco";

const client = createClient({
  apps: {
    "1001fx": {
      apiKey: "your-api-key"
    }
  }
});
``` 