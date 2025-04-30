# Perplexity App for deco.cx

This app integrates the Perplexity AI API into your deco.cx project.

## Features

- Generate AI responses using Perplexity models
- Configure search parameters including domain filtering and context size
- Simple integration with deco projects

## Usage

### Installation

1. Add your Perplexity API key when installing the app
2. Configure your default model (defaults to "sonar")

### Generating Completions

Use the `chat` loader to generate completions with Perplexity AI:

```ts
// Example usage in a loader or section
import { useLoader } from "$store/loaders/useLoader.ts";
import type { Message } from "perplexity/client.ts";

const messages: Message[] = [
  {
    role: "system",
    content: "Be precise and concise."
  },
  {
    role: "user",
    content: "How many stars are there in our galaxy?"
  }
];

const completion = useLoader("perplexity/loaders/chat.ts", {
  messages,
  model: "sonar", // Optional, uses default if not specified
  temperature: 0.2,
  search_context_size: "high"
});
```

## Support

For more information about the Perplexity API, visit the [official documentation](https://docs.perplexity.ai/). 