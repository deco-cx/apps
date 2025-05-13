# DiscoHook

A simple and elegant solution for sending messages to Discord channels using webhooks.

## What is DiscoHook?

DiscoHook is a lightweight application that allows you to send customized messages to Discord channels through webhooks. Whether you need to integrate notifications from your applications, create automated announcements, or simply send formatted messages to your Discord server, DiscoHook makes it simple and straightforward.

## Features

- Send text messages to Discord channels
- Support for embeds with customized colors, titles, and descriptions
- Ability to include images and attachments
- Support for user avatars and custom usernames
- Simple and intuitive interface

## How to Get a Discord Webhook URL

To use DiscoHook, you'll need a webhook URL from Discord. Here's how to get one:

1. **Open Discord** and navigate to the server where you have administrator permissions
2. **Select a channel** where you want the messages to appear
3. **Open Channel Settings** by clicking the gear icon next to the channel name
4. **Select "Integrations"** from the left sidebar
5. **Click "Webhooks"** and then "Create Webhook"
6. **Give your webhook a name** and optionally upload an avatar
7. **Click "Copy Webhook URL"** to copy the webhook URL to your clipboard

This URL is what you'll use in DiscoHook to send messages to this specific channel.

## Setting Up DiscoHook

1. Clone this repository
2. Install dependencies with `npm install` or `yarn install`
3. Configure your webhook URL in the application
4. Start using DiscoHook to send messages to your Discord channel

## Security Notice

Never share your webhook URL publicly. Anyone with your webhook URL can send messages to your Discord channel. If your webhook URL is compromised, you can delete it in the Discord channel settings and create a new one.
