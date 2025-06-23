# Realtime

The realtime plugin provides pub-sub capabilities. This enables real-time multiplayer experiences where users can see each other's actions instantly.

## Overview

The realtime client allows you to:

- **Connect** to realtime channels for receiving messages
- **Handle** connection lifecycle events (connect/disconnect)
- **Process** incoming messages with custom logic
- **Manage** multiple channel subscriptions
- **Disconnect** from channels when no longer needed

## Architecture

Realtime functionality in Devvit follows a client/server architecture:

- **Client-side** (`@devvit/client`): Subscribe to channels and receive messages
- **Server-side** (`@devvit/realtime`): Send messages to channels

This separation ensures that message sending is controlled by server-side logic while clients can freely subscribe to channels they're interested in.

## Client-Side API Reference

### connectRealtime

Connects to a realtime channel for receiving messages.

```tsx
import { connectRealtime } from '@devvit/client';

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

## Server-Side API Reference

### Realtime Plugin

The server-side plugin for sending messages to realtime channels.

```tsx
import { realtime } from '@devvit/realtime';

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

## Usage Examples

### Client-Side: Basic Channel Connection

```tsx
import { connectRealtime } from '@devvit/client';

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

### Client-Side: Connection Lifecycle Management

```tsx
import { connectRealtime } from '@devvit/client';

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

### Server-Side: Sending Messages

```tsx
import { realtime } from '@devvit/realtime';

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
