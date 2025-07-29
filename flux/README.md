# FLUX.1 Kontext Integration

This app provides integration with FLUX.1 Kontext Pro, a state-of-the-art image generation model by Black Forest Labs. It allows you to generate high-quality images from text prompts with extensive customization options.

## Features

- **Text-to-Image Generation**: Create images from detailed text descriptions
- **Flexible Aspect Ratios**: Support for ratios from 3:7 to 7:3 (all ~1MP total)
- **Format Options**: Generate JPEG or PNG images
- **Seed Control**: Reproducible generations with custom seeds
- **Prompt Upsampling**: Enhanced prompt processing for better results
- **Safety Controls**: Configurable content moderation levels
- **Async Support**: Upload directly to presigned URLs for workflow integration
- **Webhook Support**: Get notified when generation completes

## Setup

1. **Get API Key**: Sign up at [BFL AI](https://api.bfl.ai) and get your API key
2. **Configure the App**: Add your API key to the app configuration
3. **Deploy**: The app is ready to use in your deco.cx workflows

### Configuration

```typescript
import { FluxApp } from "./apps/flux/mod.ts";

export default {
  apps: {
    flux: FluxApp({
      apiKey: "your-bfl-api-key-here", // or use Secret loader
      baseUrl: "https://api.bfl.ai", // optional, defaults to official API
    }),
  },
};
```

## Usage Examples

### Basic Image Generation

```typescript
// Generate a simple image
const result = await invoke("flux/actions/generateImage", {
  prompt: "A serene mountain landscape at sunset with a lake reflection",
  aspect_ratio: "16:9",
  output_format: "jpeg",
});

console.log(result.imageUrl); // Valid for 10 minutes
```

### Advanced Generation with Custom Settings

```typescript
// Generate with specific parameters
const result = await invoke("flux/actions/generateImage", {
  prompt: "Abstract expressionist painting Pop Art and cubism early 20 century, straight lines and solids, cute cat face without body, warm colors, green, intricate details, hologram floating in space, a vibrant digital illustration, black background, flat color, 2D, strong lines.",
  aspect_ratio: "1:1",
  seed: 42, // For reproducible results
  prompt_upsampling: true,
  safety_tolerance: 1,
  output_format: "png", // For better quality with transparency
});
```

### Async Generation with Presigned URLs

```typescript
// For workflow integration - upload directly to your storage
const result = await invoke("flux/actions/generateImage", {
  prompt: "A cute round rusted robot repairing a classic pickup truck, colorful, futuristic, vibrant glow, van gogh style",
  presignedUrls: ["https://your-bucket.s3.amazonaws.com/image.jpg?presigned-params"],
  aspect_ratio: "4:3",
  output_format: "jpeg",
});

// Returns immediately with success: true
// Image will be uploaded to your URL when ready
```

## Parameters Reference

### Required Parameters

- **`prompt`** (string): Text description of the desired image

### Optional Parameters

- **`aspect_ratio`** (string, default: "1:1"): Desired aspect ratio
  - Examples: "1:1", "16:9", "9:16", "4:3", "3:2"
  - Range: 3:7 to 7:3

- **`seed`** (number | null, default: null): Seed for reproducibility
  - Use same seed + prompt for consistent results

- **`prompt_upsampling`** (boolean, default: false): Enhance prompt processing
  - Recommended for text-to-image generation

- **`safety_tolerance`** (number, default: 2): Content moderation level
  - 0: Most strict
  - 1: Moderate
  - 2: Least strict (for this endpoint)

- **`output_format`** (string, default: "jpeg"): Image format
  - "jpeg": Smaller files, no transparency
  - "png": Lossless, supports transparency

- **`presignedUrls`** (string[]): URLs for async upload
  - When provided, enables asynchronous processing
  - Must have PUT permission

- **`webhook_url`** (string): URL for completion notification
  - Receives POST request when generation completes

- **`webhook_secret`** (string): Secret for webhook verification
  - Sent in X-Webhook-Secret header

## Response Format

### Synchronous Response
```typescript
{
  success: true,
  imageUrl: "https://signed-url-to-image.com", // Valid for 10 minutes
  message: "Image generated successfully. Note: The URL is valid for 10 minutes."
}
```

### Asynchronous Response (with presignedUrls)
```typescript
{
  success: true,
  message: "Image generation started. The image will be uploaded to the provided URLs when ready."
}
```

### Error Response
```typescript
{
  success: false,
  error: "Detailed error message"
}
```

## Prompt Writing Tips

Based on the examples from FLUX documentation, here are some tips for writing effective prompts:

### Detailed Descriptions Work Best
```
"Close-up of a vintage car hood under heavy rain, droplets cascading down the deep cherry-red paint, windshield blurred with streaks of water, glowing headlights diffused through mist, reflections of crimson neon signage spelling "FLUX" dancing across the wet chrome grille, steam rising from the engine, ambient red light enveloping the scene, moody composition, shallow depth of field, monochromatic red palette, cinematic lighting with glossy textures."
```

### Art Style Specifications
```
"Abstract expressionist painting Pop Art and cubism early 20 century, straight lines and solids, cute cat face without body, warm colors, green, intricate details, hologram floating in space, a vibrant digital illustration, black background, flat color, 2D, strong lines."
```

### Scene Composition Elements
- **Lighting**: "cinematic lighting", "ambient red light", "dramatic shadows"
- **Mood**: "moody composition", "mysterious", "serene"
- **Quality**: "8k resolution", "detailed textures", "high contrast"
- **Style**: "photorealistic", "van gogh style", "retro game style"

## API Limits and Considerations

- **URL Validity**: Generated image URLs are valid for 10 minutes only
- **Processing Time**: Generation typically takes 10-60 seconds
- **Polling**: The app automatically polls for results every 1.5 seconds
- **Timeout**: Operations timeout after 90 seconds
- **Content Policy**: All generations are subject to BFL's content policy

## Error Handling

The app includes comprehensive error handling:

- Network failures are retried automatically
- Polling timeouts are handled gracefully
- Invalid parameters return descriptive error messages
- Async upload failures write error messages to presigned URLs

## Integration Examples

### With deco.cx Workflows
```typescript
// In a deco.cx loader or action
export default async function generateProductImage(props: Props, req: Request, ctx: AppContext) {
  const fluxResult = await ctx.invoke("flux/actions/generateImage", {
    prompt: `Product photography of ${props.productName}, white background, professional lighting, 4k`,
    aspect_ratio: "1:1",
    output_format: "png",
    presignedUrls: [props.uploadUrl],
  });
  
  return { generated: fluxResult.success };
}
```

### With External Storage
```typescript
// Generate and upload to S3
const presignedUrl = await getPresignedUploadUrl("my-bucket", "generated-image.jpg");

const result = await invoke("flux/actions/generateImage", {
  prompt: "Your amazing prompt here",
  presignedUrls: [presignedUrl],
  output_format: "jpeg",
});
```

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Verify your BFL API key is correct
2. **"Timeout"**: Large or complex prompts may take longer; consider simplifying
3. **"Content violation"**: Adjust safety_tolerance or modify prompt content
4. **"Upload failed"**: Check presigned URL permissions and expiration

### Debug Mode

Enable debug logging by setting `DEBUG_HTTP=true` in your environment to see detailed HTTP requests.

## Support

- **Documentation**: [FLUX API Docs](https://docs.bfl.ai/)
- **Community**: [BFL Discord](https://discord.gg/bfl)
- **Issues**: Report bugs in this repository

## License

This integration is part of the deco.cx apps ecosystem. See the main repository for license information. 