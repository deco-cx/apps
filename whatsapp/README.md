# WhatsApp Cloud API for Deco.cx

This app integrates the WhatsApp Cloud API into the deco.cx platform, allowing you to send and receive WhatsApp messages.

## Setup

To use this app, you need to:

1. Have a WhatsApp Business Account
2. Create a Meta App in the [Meta for Developers Portal](https://developers.facebook.com/)
3. Enable the WhatsApp product in your Meta App
4. Configure your WhatsApp phone number
5. Generate an access token for your app

## Installation

1. Install the WhatsApp app in your deco.cx project
2. Configure the app with your:
   - WhatsApp Phone Number ID
   - Meta App Access Token
   - API Version (optional, defaults to "v22.0")

## Features

### Send Text Messages

Send simple text messages to WhatsApp users.

### Send Media Messages

Send media files (images, audio, video, documents, or stickers) to WhatsApp users.

### Send Template Messages

Send pre-approved message templates with dynamic content.

### Mark Messages as Read

Mark received messages as read.

### Receive Messages via Webhook

Receive incoming messages and status updates via a webhook.

## Documentation

For more information about the WhatsApp Cloud API, please visit the [official documentation](https://developers.facebook.com/docs/whatsapp/cloud-api).

## Examples

### Sending a Text Message

```ts
// Actions
import { Props } from "deco/types.ts";

interface TextMessageProps extends Props {
  to: string;
  text: string;
  previewUrl?: boolean;
}

export default function sendWhatsAppMessage({
  to,
  text,
  previewUrl = false,
}: TextMessageProps) {
  return ctx.invoke("whatsapp/actions/messages/send-text.ts", {
    to,
    text,
    previewUrl,
  });
}
```

### Sending a Template Message

```ts
// Actions
import { Props } from "deco/types.ts";

interface TemplateMessageProps extends Props {
  to: string;
  templateName: string;
  languageCode: string;
  headerParams?: string;
  bodyParams?: string;
}

export default function sendTemplateMessage({
  to,
  templateName,
  languageCode,
  headerParams,
  bodyParams,
}: TemplateMessageProps) {
  return ctx.invoke("whatsapp/actions/messages/send-template.ts", {
    to,
    templateName,
    languageCode,
    headerParams,
    bodyParams,
  });
}
```

### Setting up a Webhook

```ts
// Actions
import { Props } from "deco/types.ts";

interface WebhookSetupProps extends Props {
  webhookUrl: string;
  accessToken: string;
  callbackPersist?: boolean;
  sentStatus?: boolean;
  deliveredStatus?: boolean;
  readStatus?: boolean;
}

export default function setupWhatsAppWebhook({
  webhookUrl,
  accessToken,
  callbackPersist = true,
  sentStatus = true,
  deliveredStatus = true,
  readStatus = true,
}: WebhookSetupProps) {
  return ctx.invoke("whatsapp/actions/setup-webhook.ts", {
    webhookUrl,
    accessToken,
    callbackPersist,
    sentStatus,
    deliveredStatus,
    readStatus,
  });
}
```

### Creating a Webhook Handler

To receive incoming messages, you need to create a handler for the webhook events. Below is an example of how to set up a webhook handler using the provided action:

1. Create a new endpoint in your project that will serve as the webhook URL
2. Configure this URL in the WhatsApp API settings using the `setup-webhook.ts` action
3. Implement the webhook handler to process incoming messages

```ts
import { Router } from "oak";

const router = new Router();

router.post("/api/whatsapp/webhook", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    
    // Process incoming messages
    if (body.messages && body.messages.length > 0) {
      for (const message of body.messages) {
        console.log(`Message from ${message.from}: ${message.text?.body || '[non-text content]'}`);
        // Process the message here
      }
    }
    
    // Always return 200 OK to acknowledge receipt
    ctx.response.status = 200;
    ctx.response.body = { success: true };
  } catch (error) {
    console.error("Error processing webhook:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to process webhook" };
  }
});

export default router;
``` 