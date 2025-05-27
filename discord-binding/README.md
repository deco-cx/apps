# Discord Binding MCP

This project is an example of an MCP (Model Context Protocol) binding for input and output operations using the Discord API.

## Overview

The `discord-binding` demonstrates how to implement a custom binding that processes input and output streams using the MCP pattern, specifically for Discord webhooks and OAuth. It is designed to help you understand how to handle Discord payloads, validate webhook signatures, and manage OAuth authentication in a modular and extensible way.

## How it works

- The binding receives a payload from Discord webhooks (see `Payload` interface in `mod.ts`).
- It validates the Discord signature headers and handles ping events.
- It maps the payload to options and handles different stream parts (text, data, file, source, error, etc.) by processing them as needed.
- It supports sending messages to Discord via webhook.
- OAuth is implemented to allow user authentication and access to Discord resources.

## Where to look

- **@mod.ts**: See `discord-binding/mod.ts` for an example use case, showing how to set up handlers for different stream parts and how to use the binding.
- **@actions/bindings/input.ts**: Handles incoming Discord webhook events, validates signatures, and processes payloads.
- **@actions/bindings/output.ts**: Handles sending messages to Discord.
- **@loaders/oauth/start.ts** and **@actions/oauth/callback.ts**: Implement Discord OAuth2 flow.

## Usage

This example is intended for developers looking to understand or extend MCP bindings for Discord. You can use it as a reference or starting point for your own bindings. 