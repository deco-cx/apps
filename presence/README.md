<h1>
  <p align="center">
    <img alt="Presence" src="https://raw.githubusercontent.com/viktormarinho/deco-apps/main/presence/Presence.png" width="250" height="120"/>
  </p>
</h1>

<p align="center">
  <strong>
    Optimize your e-commerce conversion with Realtime Social Proof emotional triggers
  </strong>
</p>

<p align="center">
  Plug and play Sections, Handlers and Actions for your deco.cx Website.
</p>

## Installation

1. Install via decohub
2. Create a Presence App Block

**Presence is now ready to be configured.**

## Configuration

1. Setup the Presence handler and configure it to your needs.

Here is an example of how you would do that:

```bash
├── apps
├── components
├── islands
├── loaders
├── routes
  └── presence
    └── index.ts   <-- Create this file
├── sdk
├── sections
└── static
```

```ts
import { createPresenceHandler } from "apps/presence/infra/presenceRoom.ts"

export const handler = createPresenceHandler({});
```

For the default configuration, this already is it!
If you want to go deeper, Presence lets you hook into some events, like
when an error happens (useful for logging and metrics), 
or when the WebSocket server broadcasts messages to a room (useful for extending behavior).

Here is a more complex example:

```ts
export const handler = createPresenceHandler({
    onError: (e) => {
        someLogService.registerError(e);
    },
    onRoomStateChange: (room) => {
        otherRealtimeService.notifyStateChange(room.connections);
    }
});
```

2. Now you can use any Presence Section, and they will use the Presence handler to track all of the needed realtime logic.

For example, if you want to display the PresenceCounter section, 
that shows a counter of how much people are in the current page (Useful for Social Proof triggers),
you can use it like this:

```bash
├── apps
├── components
├── islands
  └── Presence
    └── PresenceCounter.tsx   <-- Create this file
├── loaders
├── routes
├── sdk
├── sections
└── static
```

```ts
export { type Props } from "apps/presence/sections/Presence/PresenceCounter.tsx";
export { default } from "apps/presence/sections/Presence/PresenceCounter.tsx";
```

Fresh will not let any external Deco App create an Island unless you explicitly 
re-export it in the Islands folder, so this step is needed for the component to work properly.

Thats about it for the PresenceCounter. Now when you open your Sections panel on `admin.deco.cx` you
will be able to add the PresenceCounter to any page, and configure it via Section Props.