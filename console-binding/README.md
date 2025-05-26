# Console Binding MCP

This project is an example of an MCP (Message Control Protocol) binding for input and output operations.

## Overview

The `console-binding` demonstrates how to implement a custom binding that processes input and output streams using the MCP pattern. It is designed to help you understand how to handle various types of payloads and stream events in a modular and extensible way.

## How it works

- The binding receives a payload (see `Payload` interface in `mod.ts`).
- It maps the payload to options and handles different stream parts (text, data, file, source, error, etc.) by logging them to the console.
- This is useful for debugging, prototyping, or as a template for building more complex bindings.

## Where to look

- **@binding folder**: Contains the core binding logic and utilities. Check `binding/mod.ts` for the main binding implementation.
- **@mod.ts**: See `console-binding/mod.ts` for an example use case, showing how to set up handlers for different stream parts and how to use the binding.

## Usage

This example is intended for developers looking to understand or extend MCP bindings. You can use it as a reference or starting point for your own bindings.