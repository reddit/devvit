# @devvit/server

The `@devvit/server` package provides core server-side functionality for Devvit Web apps. It allows you to create HTTP servers, manage request context, and configure your Devvit app with a traditional client/server architecture.

## Overview

The `@devvit/server` package works seamlessly with Devvit Web, providing:

- **HTTP Server Creation**: Create and configure HTTP servers for your Devvit Web app
- **Request Context Management**: Access request-specific context and metadata
- **App Configuration**: Define app permissions, post types, and server behavior
- **Port Management**: Handle server port configuration for different environments

## Installation

The `@devvit/server` package is included by default in Devvit Web projects. If you need to install it manually:

```bash
npm install @devvit/server
```

## API Reference

### `createServer`

Creates a new Devvit HTTP server with the same API as Node.js's `createServer` function. You must use this variant of createServer, and not the one that is available directly from Node.js.

```typescript
import { createServer } from '@devvit/server';

// Basic usage
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello from Devvit!' }));
});
```

**Parameters:**

- `optionsOrRequestListener` (optional): Server options or request handler function
- `requestListener` (optional): Request handler function

**Returns:** A Node.js HTTP server instance

**Note:** The server may not actually create an HTTP server under the hood, but it will behave like one in terms of API compatibility.

### `context`

A proxy object that provides access to the current request context. This is automatically set by the server when handling requests.

```typescript
import { context } from '@devvit/server';

// In your request handler
app.get('/api/data', (req, res) => {
  // Access request context
  const postId = context.postId;
  const subredditName = context.subredditName;
  const userId = context.userId;

  // Use context data in your response
  res.json({
    postId,
    subredditName,
    userId,
  });
});
```

**Available Context Properties:**

- `postId`: The ID of the current post (if applicable)
- `subredditName`: The name of the current subreddit
- `userId`: The ID of the current user
- `userName`: The username of the current user
- `isModerator`: Whether the current user is a moderator
- `isLoggedIn`: Whether the current user is logged in

**Note:** If you try to access `context` outside of a server request, it will throw an error.

### `getServerPort`

Gets the port number that the server should run on, reading from the `WEBBIT_PORT` environment variable.

```typescript
import { createServer, getServerPort } from '@devvit/server';

const server = createServer((req, res) => {
  // Handle request
});

// Start server on the configured port
server.listen(getServerPort());
```

**Returns:** Port number (defaults to 3000 if `WEBBIT_PORT` is not set)

### `RequestContext`

Type definition for the request context object.

```typescript
import type { RequestContext } from '@devvit/server';

function handleRequest(req: Request, res: Response) {
  // RequestContext type is automatically inferred when using context
  const ctx: RequestContext = context;
}
```

## Usage Examples

### Basic Express.js Server

```typescript
import express from 'express';
import { createServer, getServerPort, context } from '@devvit/server';

const app = express();

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from Devvit!',
    postId: context.postId,
    subredditName: context.subredditName,
  });
});

app.post('/api/data', express.json(), (req, res) => {
  // Handle POST request with JSON body
  res.json({ success: true });
});

const server = createServer(app);
server.listen(getServerPort());
```

### Server with Custom Middleware

```typescript
import express from 'express';
import { createServer, getServerPort, context } from '@devvit/server';

const app = express();

// Custom middleware to log request context
app.use((req, res, next) => {
  console.log('Request context:', {
    postId: context.postId,
    subredditName: context.subredditName,
    userId: context.userId,
  });
  next();
});

app.get('/api/user-info', (req, res) => {
  if (!context.isLoggedIn) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  res.json({
    userId: context.userId,
    userName: context.userName,
    isModerator: context.isModerator,
  });
});

const server = createServer(app);
server.listen(getServerPort());
```

## Limitations

- **Serverless execution**: Server endpoints run in a serverless environment with limited execution time
- **No persistent connections**: WebSocket connections and long-running processes are not supported
- **Package restrictions**: Node.js packages that rely on specific native dependencies may not be available in the serverless environment
- **Request/response only**: Streaming responses and chunked transfers are not supported

## Related Documentation

- [Devvit Web Overview](./devvit_web_overview)
- [Devvit Web Quickstart](./devvit_web_quickstart)
- [@devvit/client Documentation](../client)
- [Devvit Web Templates](./devvit_web_templates)
