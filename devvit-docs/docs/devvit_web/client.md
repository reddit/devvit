# @devvit/client

The `@devvit/client` package provides client-side functionality for Devvit Web apps. It enables client-side effects like showing toasts, displaying forms, navigating to different pages, and connecting to realtime channels.

## Overview

The `@devvit/client` package works seamlessly with Devvit Web, providing:

- **Client Context**: Access to request-specific context and metadata
- **UI Effects**: Show toasts, forms, and navigation
- **Realtime Communication**: Connect to realtime channels for live updates
- **Type Safety**: Full TypeScript support for all client-side operations

## Installation

The `@devvit/client` package is included by default in Devvit Web projects. If you need to install it manually:

```bash
npm install @devvit/client
```

## API Reference

### `context`

A proxy object that provides access to the current request context on the client side. This mirrors the server-side context but is available in client-side code.

```typescript
import { context } from '@devvit/client';

// Access request context in client-side code
const postId = context.postId;
const subredditName = context.subredditName;
const userId = context.userId;
const userName = context.userName;
const isModerator = context.isModerator;
const isLoggedIn = context.isLoggedIn;
```

**Available Context Properties:**

- `postId`: The ID of the current post (if applicable)
- `subredditName`: The name of the current subreddit
- `userId`: The ID of the current user
- `userName`: The username of the current user
- `isModerator`: Whether the current user is a moderator
- `isLoggedIn`: Whether the current user is logged in

### `showToast`

Shows a toast notification to the user. Toasts are temporary messages that appear at the top of the screen.

```typescript
import { showToast } from '@devvit/client';

// Simple text toast
showToast('Operation completed successfully!');

// Toast with custom appearance
showToast({
  text: 'Data saved successfully!',
  appearance: 'success', // 'neutral' | 'success'
});
```

**Parameters:**

- `textOrToast`: Either a string message or a `Toast` object

**Toast Object Properties:**

- `text`: The message to display
- `appearance`: The visual style ('neutral' or 'success')

### `showForm`

Opens a modal form for user input. Returns a promise that resolves with the form submission results.

```typescript
import { showForm } from '@devvit/client';

// Basic form
const result = await showForm({
  title: 'User Settings',
  description: 'Update your preferences',
  fields: [
    {
      type: 'string',
      name: 'username',
      label: 'Username',
      required: true,
    },
    {
      type: 'boolean',
      name: 'notifications',
      label: 'Enable notifications',
      defaultValue: true,
    },
  ],
  acceptLabel: 'Save',
  cancelLabel: 'Cancel',
});

if (result.action === 'SUBMITTED') {
  console.log('Form values:', result.values);
  // result.values = { username: 'john_doe', notifications: true }
} else {
  console.log('Form was canceled');
}
```

**Form Configuration:**

#### Basic Form Properties

- `title`: Optional title for the form
- `description`: Optional description text
- `fields`: Array of form fields
- `acceptLabel`: Label for the submit button (default: "Submit")
- `cancelLabel`: Label for the cancel button (default: "Cancel")

#### Form Field Types

**String Field**

```typescript
{
  type: 'string',
  name: 'fieldName',
  label: 'Field Label',
  required?: boolean,
  defaultValue?: string,
  helpText?: string,
  disabled?: boolean,
  isSecret?: boolean // For password fields
}
```

**Paragraph Field**

```typescript
{
  type: 'paragraph',
  name: 'description',
  label: 'Description',
  required?: boolean,
  defaultValue?: string,
  helpText?: string,
  disabled?: boolean
}
```

**Number Field**

```typescript
{
  type: 'number',
  name: 'age',
  label: 'Age',
  required?: boolean,
  defaultValue?: number,
  helpText?: string,
  disabled?: boolean
}
```

**Boolean Field**

```typescript
{
  type: 'boolean',
  name: 'enabled',
  label: 'Enable feature',
  defaultValue?: boolean,
  helpText?: string,
  disabled?: boolean
}
```

**Select Field**

```typescript
{
  type: 'select',
  name: 'category',
  label: 'Category',
  required?: boolean,
  defaultValue?: string[],
  helpText?: string,
  disabled?: boolean,
  options: [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' }
  ]
}
```

**Image Field**

```typescript
{
  type: 'image',
  name: 'avatar',
  label: 'Profile Picture',
  helpText?: string,
  disabled?: boolean
}
```

**Field Groups**

```typescript
{
  type: 'group',
  label: 'Personal Information',
  helpText?: string,
  fields: [
    // ... other fields
  ]
}
```

**Returns:** Promise that resolves to:

- `{ action: 'SUBMITTED', values: FormValues }` - Form was submitted
- `{ action: 'CANCELED' }` - Form was canceled

### `navigateTo`

Navigates to a URL, subreddit, post, comment, or user profile.

```typescript
import { navigateTo } from '@devvit/client';

// Navigate to a URL
navigateTo('https://www.reddit.com/r/devvit');

// Navigate to a subreddit
navigateTo(subreddit);

// Navigate to a post
navigateTo(post);

// Navigate to a comment
navigateTo(comment);

// Navigate to a user profile
navigateTo(user);
```

**Parameters:**

- `thingOrUrl`: A URL string or Reddit object (Subreddit, Post, Comment, User)

### `connectRealtime`

Connects to a realtime channel for receiving live messages and updates.

```typescript
import { connectRealtime } from '@devvit/client';

const connection = await connectRealtime({
  channel: 'my-app-channel',
  onConnect: (channel) => {
    console.log(`Connected to channel: ${channel}`);
  },
  onDisconnect: (channel) => {
    console.log(`Disconnected from channel: ${channel}`);
  },
  onMessage: (data) => {
    console.log('Received message:', data);
    // Handle incoming realtime data
  },
});

// Later, disconnect from the channel
await connection.disconnect();
```

**Connection Options:**

- `channel`: The channel name to connect to
- `onConnect`: Callback when connection is established
- `onDisconnect`: Callback when connection is lost
- `onMessage`: Callback for incoming messages

**Returns:** A `Connection` object with a `disconnect()` method

## Usage Examples

### Basic Client-Side App

```typescript
// client/index.ts
import { context, showToast, showForm, navigateTo } from '@devvit/client';

// Access context
console.log('Current user:', context.userName);
console.log('Current subreddit:', context.subredditName);

// Show a welcome toast
if (context.isLoggedIn) {
  showToast({
    text: `Welcome back, ${context.userName}!`,
    appearance: 'success',
  });
}

// Handle form submission
async function handleSettingsForm() {
  const result = await showForm({
    title: 'App Settings',
    fields: [
      {
        type: 'string',
        name: 'displayName',
        label: 'Display Name',
        defaultValue: context.userName || '',
        required: true,
      },
      {
        type: 'boolean',
        name: 'enableNotifications',
        label: 'Enable Notifications',
        defaultValue: true,
      },
    ],
  });

  if (result.action === 'SUBMITTED') {
    showToast('Settings saved successfully!');
    // Send data to server
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.values),
    });
  }
}
```

### Realtime Chat Application

```typescript
// client/chat.ts
import { connectRealtime, showToast } from '@devvit/client';

class ChatApp {
  private connection: any;

  async initialize() {
    try {
      this.connection = await connectRealtime({
        channel: `chat-${context.subredditName}`,
        onConnect: (channel) => {
          showToast(`Connected to ${channel}`);
        },
        onDisconnect: (channel) => {
          showToast(`Disconnected from ${channel}`);
        },
        onMessage: (data) => {
          this.handleMessage(data);
        },
      });
    } catch (error) {
      showToast('Failed to connect to chat');
    }
  }

  private handleMessage(data: any) {
    // Handle incoming chat messages
    if (data.type === 'message') {
      this.displayMessage(data.message, data.user);
    }
  }

  async sendMessage(message: string) {
    // Send message to server
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.disconnect();
    }
  }
}
```

### Form with Validation

```typescript
// client/forms.ts
import { showForm, showToast } from '@devvit/client';

async function showUserProfileForm() {
  const result = await showForm({
    title: 'Update Profile',
    description: 'Update your profile information',
    fields: [
      {
        type: 'string',
        name: 'displayName',
        label: 'Display Name',
        required: true,
        helpText: 'This will be shown to other users',
      },
      {
        type: 'paragraph',
        name: 'bio',
        label: 'Bio',
        helpText: 'Tell us about yourself',
      },
      {
        type: 'select',
        name: 'interests',
        label: 'Interests',
        options: [
          { label: 'Technology', value: 'tech' },
          { label: 'Gaming', value: 'gaming' },
          { label: 'Sports', value: 'sports' },
          { label: 'Music', value: 'music' },
        ],
        defaultValue: [],
      },
      {
        type: 'boolean',
        name: 'publicProfile',
        label: 'Make profile public',
        defaultValue: false,
      },
    ],
    acceptLabel: 'Update Profile',
    cancelLabel: 'Cancel',
  });

  if (result.action === 'SUBMITTED') {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.values),
      });

      if (response.ok) {
        showToast({
          text: 'Profile updated successfully!',
          appearance: 'success',
        });
      } else {
        showToast('Failed to update profile');
      }
    } catch (error) {
      showToast('Network error occurred');
    }
  }
}
```

## Type Definitions

### `Toast`

```typescript
type Toast = {
  text: string;
  appearance?: 'neutral' | 'success';
};
```

### `FormAction`

```typescript
type FormAction = 'CANCELED' | 'SUBMITTED';
```

### `FormEffectResponse`

```typescript
type FormEffectResponse<T> = { action: 'CANCELED' } | { action: 'SUBMITTED'; values: T };
```

## Related Documentation

- [Devvit Web Overview](./devvit_web_overview)
- [Devvit Web Quickstart](./devvit_web_quickstart)
- [@devvit/server Documentation](./server)
- [Devvit Web Templates](./devvit_web_templates)
