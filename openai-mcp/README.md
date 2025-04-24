# OpenAI App for Deco

This app integrates OpenAI's API services into the Deco platform, providing powerful AI image generation and editing capabilities for your applications. The app is designed to work with the official OpenAI API and provides a simple interface to access its functionality.

## Features

- **Image Generation**: Create high-quality images from text prompts using GPT-image-1, DALL-E 3, or DALL-E 2 models
- **Image Editing**: Modify existing images, create compositions from multiple images, or use inpainting to edit specific areas
- **Presigned URL Support**: Upload generated/edited images directly to cloud storage for immediate access

## Setup

### Prerequisites

- An OpenAI API key with access to the image generation models
- If using GPT-image-1, your organization may need to complete API Organization Verification

### Configuration

When installing the app, you need to provide:

- `apiKey` (required): Your OpenAI API key for authentication

## Actions

### Generate Image

Creates images from text descriptions using OpenAI's image generation models. This action provides extensive customization options to control the output quality, size, and format.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `presignedUrl` | string | (optional) | A presigned URL where the generated image will be uploaded. When provided, the image will be uploaded to this URL rather than returned as base64. |
| `prompt` | string | (required) | The text description of the image you want to create. Be specific and detailed about style, content, lighting, composition, etc. |
| `model` | string | "gpt-image-1" | The model to use for generation: "gpt-image-1", "dall-e-3", or "dall-e-2". Each model has different capabilities. |
| `size` | string | "1024x1024" | The dimensions of the output image. Options include "256x256", "512x512", "1024x1024", "1792x1024", "1024x1792", "1536x1024", "1024x1536". |
| `quality` | string | "standard" | The rendering quality and detail level. For gpt-image-1: "low", "medium", "high". For dall-e-3: "standard", "hd". |
| `style` | string | "vivid" | (DALL-E 3 only) Controls the stylistic approach: "vivid" for more dramatic colors, "natural" for more realistic tones. |
| `n` | number | 1 | Number of images to generate. Maximum values vary by model: gpt-image-1 (4), dall-e-3 (1), dall-e-2 (10). When using presignedUrl, only the first image is uploaded. |
| `format` | string | "png" | Output format: "png" (lossless, supports transparency), "jpeg" (smaller files), or "webp" (good compression, supports transparency). |
| `background` | string | "opaque" | Controls background transparency: "opaque" (solid) or "transparent" (only for PNG/WebP formats). |
| `compression` | number | (undefined) | Compression level for JPEG/WebP (0-100): 0 = maximum compression, 100 = minimum compression. |
| `moderation` | string | "auto" | (GPT-image-1 only) Content filtering level: "auto" (standard) or "low" (less restrictive). |

#### Response Format

When using a presigned URL:

```json
{
  "success": true,
  "url": "https://your-storage.com/path/to/image.png",
  "urls": ["https://your-storage.com/path/to/image.png"],
  "model": "gpt-image-1",
  "prompt": "A futuristic city with flying cars"
}
```

When not using a presigned URL:

```json
{
  "success": true,
  "images": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."],
  "model": "gpt-image-1",
  "prompt": "A futuristic city with flying cars and tall glass buildings at sunset"
}
```

#### Best Practices

1. **Prompts**
   - Be specific and detailed in your prompts
   - Include style references, e.g., "in the style of watercolor painting"
   - Mention composition details, e.g., "close-up shot", "wide angle"
   - Specify lighting, e.g., "dramatic lighting", "soft morning light"

2. **Model Selection**
   - Use `gpt-image-1` for best text rendering and detailed control
   - Use `dall-e-3` for high-quality creative interpretations
   - Use `dall-e-2` for lower cost or when you need to create variations

3. **Quality/Performance Tradeoffs**
   - Higher quality settings produce better images but take longer and cost more
   - For quick drafts or previews, use "low" quality
   - For production-ready images, use "medium" or "high" quality

4. **Presigned URLs**
   - Use presigned URLs for larger image sizes or when you need direct access to the image
   - Ensure your presigned URL has PUT permissions and the correct content type settings
   - For multi-image generation (n > 1), only the first image will be uploaded to the presigned URL

### Edit Image

Modifies existing images or creates new composite images based on text prompts and reference images. This action supports three main workflows:
1. Inpainting (editing parts of an image using a mask)
2. Multi-image composition (creating a new image from multiple reference images)
3. Simple image editing (modifying a single image)

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `presignedUrl` | string | (optional) | A presigned URL where the edited image will be uploaded. When provided, the image will be uploaded to this URL rather than returned as base64. |
| `prompt` | string | (required) | The text description of how to edit the image or what the final result should look like. |
| `imageUrl` | string | (required) | URL to the primary image that will be edited. Must be accessible and in a supported format. |
| `maskUrl` | string | (optional) | URL to a mask image that indicates which parts to edit. Transparent areas will be replaced according to the prompt. |
| `referenceImageUrls` | string[] | (optional) | Array of URLs to additional reference images (max 3) to use as visual context for creating a composite image. |
| `model` | string | "gpt-image-1" | The model to use for editing: "gpt-image-1" or "dall-e-2". Note: dall-e-3 does not support editing. |
| `size` | string | "1024x1024" | The dimensions of the output image. For masked edits, should match the input image size for best results. |
| `quality` | string | "standard" | The rendering quality for gpt-image-1: "low", "medium", or "high". For precise edits, use higher quality. |
| `format` | string | "png" | Output format: "png", "jpeg", or "webp". Use PNG for edits requiring precise edge quality. |
| `background` | string | "opaque" | Background type: "opaque" or "transparent" (PNG/WebP only). |
| `compression` | number | (undefined) | Compression level for JPEG/WebP formats (0-100). |

#### Response Format

When using a presigned URL:

```json
{
  "success": true,
  "url": "https://your-storage.com/path/to/image.png",
  "urls": ["https://your-storage.com/path/to/image.png"],
  "model": "gpt-image-1",
  "prompt": "Replace the pool with a flamingo-shaped pool float"
}
```

When not using a presigned URL:

```json
{
  "success": true,
  "images": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."],
  "model": "gpt-image-1",
  "prompt": "Replace the pool with a flamingo-shaped pool float"
}
```

#### Workflows

1. **Masked Editing (Inpainting)**
   - Provide both `imageUrl` and `maskUrl`
   - The mask should have transparent areas where changes should be made
   - Describe what should appear in the transparent regions

2. **Multi-Image Composition**
   - Provide `imageUrl` and `referenceImageUrls` (without `maskUrl`)
   - Up to 4 total images can be used (1 primary + 3 reference)
   - Describe how the images should be combined

3. **Single Image Editing**
   - Provide only `imageUrl` (no mask or reference images)
   - The model will edit the image based on your prompt

#### Mask Requirements
- Must have the EXACT same dimensions as the primary image
- Must contain an alpha channel (transparent areas indicate regions to edit)
- Must be in PNG format
- Must be less than 25MB

## Using Presigned URLs

### What are Presigned URLs?

Presigned URLs are temporary URLs that grant limited-time permission to upload or download objects from cloud storage services like AWS S3, Google Cloud Storage, or Azure Blob Storage. Using presigned URLs allows the app to upload generated images directly to your storage, making them immediately accessible through a public URL.

### Benefits of Using Presigned URLs

1. **Size Limitations**: Overcome base64 size limitations for larger images
2. **Performance**: Reduce payload size in the API response
3. **Accessibility**: Images are directly accessible via URL
4. **Integration**: Seamlessly store generated assets in your existing storage

### How to Generate Presigned URLs

You can generate presigned URLs using platform-specific tools or SDKs:

- **AWS S3**: Use the `CREATE_PRESIGNED_URL` action (if available) or AWS SDK
- **Google Cloud Storage**: Use the Google Cloud Storage signedUrl method
- **Azure Blob Storage**: Use Azure Storage Shared Access Signatures (SAS)

Example presigned URL generator for AWS S3 using the AWS SDK:

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function generatePresignedUrl(bucket, key, contentType, expiresIn = 3600) {
  const client = new S3Client({ region: "us-east-1" });
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  
  return getSignedUrl(client, command, { expiresIn });
}

// Usage:
// const presignedUrl = await generatePresignedUrl('my-bucket', 'images/my-image.png', 'image/png');
```

### Important Considerations

1. **Expiration**: Presigned URLs expire after a set time (typically 15 minutes to 24 hours)
2. **Content Type**: Ensure the content type matches the image format you're generating
3. **Permissions**: The presigned URL must be created with PUT permissions
4. **Storage Configuration**: Your storage bucket must be configured for the access level you need (public/private)

## Limitations

- **Rate Limits**: OpenAI API has rate limits based on your account tier
- **Content Filtering**: All prompts and generations are filtered in accordance with OpenAI's content policy
- **Image Resolution**: Maximum supported resolution depends on the model (typically up to 1536×1536)
- **Generation Time**: Complex prompts may take up to 2 minutes to process
- **Text Rendering**: While GPT-image-1 has improved text rendering, it may still struggle with lengthy or complex text

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure your API key is correct and has the necessary permissions
   - Check if your organization needs to complete API Organization Verification

2. **Content Policy Violations**
   - Review your prompt for content that might violate OpenAI's usage policies
   - Try rephrasing the prompt to avoid restricted content

3. **Image Loading Failures**
   - Ensure all image URLs are publicly accessible
   - Check that images are in supported formats and under size limits

4. **Mask Issues for Editing**
   - Verify the mask has the exact same dimensions as the primary image
   - Confirm the mask has an alpha channel with transparent areas indicating regions to edit

5. **Presigned URL Upload Failures**
   - Check that the presigned URL has not expired
   - Ensure the presigned URL has the correct permissions (PUT)
   - Verify the content type matches the format you're generating

## Dependencies

This app uses:
- `openai`: The official OpenAI API client 