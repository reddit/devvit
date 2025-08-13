# Overview

Create live and event-driven interactive posts. Realtime provides a set of primitives that lets you build interactive posts that are:

- **Live**. Users engaging with the same interactive post see each others’ changes without any observable lag.
- **Event-driven**. Posts render automatically in response to server events.
- **Synced**. Using realtime with [Redis](../server/redis.mdx) lets you build persistent community experiences that are backed by high performance data synchronization.

Realtime is supported in both [Devvit Web](../devvit-web/devvit_web_overview.mdx) and [Devvit Blocks](../blocks/overview.md) applications.

Follow this guide, [Realtime in Devvit Blocks](./realtime_in_devvit_blocks.md), for instructions on using realtime in Devvit Blocks.

# Realtime in Devvit Web

This guide walks through step-by-step instructions on how to set up [Realtime](./overview.md) in a [Devvit Web](../devvit-web/devvit_web_overview.mdx) application

## Overview

The realtime client allows you to:

- **Connect** to realtime channels for receiving messages
- **Handle** connection lifecycle events (connect/disconnect)
- **Process** incoming messages with custom logic
- **Manage** multiple channel subscriptions
- **Disconnect** from channels when no longer needed

## Architecture

Realtime functionality in Devvit follows a client/server architecture:

- **Client-side** (connectRealtime): Subscribe to channels and receive messages
- **Server-side** (realtime.send): Send messages to channels

This separation ensures that message sending is controlled by server-side logic while clients can freely subscribe to channels they're interested in.

## Client-side API reference

### connectRealtime

Connects to a realtime channel for receiving messages.

```tsx
import { connectRealtime } from '@devvit/web/client';

const connection = await connectRealtime({
  channel: 'my-channel',
  onConnect: (channel) => {
    console.log(`Connected to ${channel}`);
  },
  onDisconnect: (channel) => {
    console.log(`Disconnected from ${channel}`);
  },
  onMessage: (data) => {
    console.log('Received message:', data);
  },
});
```

#### Parameters

- `opts` - Connection options object
  - `channel` (string) - The name of the channel to connect to
  - `onConnect?` (function) - Optional callback called when connection is established
  - `onDisconnect?` (function) - Optional callback called when connection is lost
  - `onMessage` (function) - Required callback called when a message is received

#### Returns

A `Connection` object with a `disconnect()` method.

### Connection

A connection object returned by `connectRealtime()`.

#### Methods

##### disconnect()

Disconnects from the realtime channel.

```tsx
await connection.disconnect();
```

This method:

- Removes the channel from active subscriptions
- Cleans up event listeners
- Calls the `onDisconnect` callback if provided

## Server-side API reference

### Realtime plugin

The server-side plugin for sending messages to realtime channels.

```tsx
import { realtime } from '@devvit/web/server';

// Send a message to a channel
await realtime.send('my-channel', {
  type: 'user-joined',
  userId: '123',
});
```

#### Methods

##### send(channel: string, msg: JSONValue): Promise<void>

Sends a message to a specific channel.

- `channel` (string) - The name of the channel to send the message to
- `msg` (JSONValue) - The message data to send

## Usage examples

### Client-side: basic channel connection

```tsx
import { connectRealtime } from '@devvit/web/client';

// Connect to a channel
const connection = await connectRealtime({
  channel: 'user-updates',
  onMessage: (data) => {
    // Handle incoming messages
    console.log('User update:', data);
  },
});

// Later, disconnect when done
await connection.disconnect();
```

### Client-side: connection lifecycle management

```tsx
import { connectRealtime } from '@devvit/web/client';

const connection = await connectRealtime({
  channel: 'live-chat',
  onConnect: (channel) => {
    console.log(`Connected to ${channel}`);
    // Update UI to show connected state
    setIsConnected(true);
  },
  onDisconnect: (channel) => {
    console.log(`Disconnected from ${channel}`);
    // Update UI to show disconnected state
    setIsConnected(false);
  },
  onMessage: (data) => {
    // Process chat messages
    addMessageToChat(data);
  },
});
```

### Server-side: sending messages

```tsx
import { realtime } from '@devvit/web/server';

// Send a simple message
await realtime.send('notifications', 'New user joined!');

// Send a structured message
await realtime.send('game-updates', {
  type: 'score-update',
  playerId: 'user123',
  score: 1500,
  timestamp: Date.now(),
});
```
