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
const subredditId = context.subredditId;
const appName = context.appName;
const appVersion = context.appVersion;
```

**Available Context Properties:**

- `postId`: The ID of the current post (if applicable) - T3ID format
- `subredditName`: The name of the current subreddit
- `userId`: The ID of the current user - T2ID format
- `subredditId`: The ID of the current subreddit - T5ID format
- `appName`: The name of the current app
- `appVersion`: The version of the current app

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
  defaultValue?: string[], // Array of selected option values
  helpText?: string,
  disabled?: boolean,
  options: [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' }
  ]
}
```

**Note:** Select fields support multi-selection. The `defaultValue` and returned values are arrays of strings representing the selected option values.

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

## Related Documentation

- [Devvit Web Overview](./devvit_web_overview)
- [Devvit Web Quickstart](./devvit_web_quickstart)
- [@devvit/server Documentation](./server)
- [Devvit Web Templates](./devvit_web_templates)
