# Migration guide

With version 0.10.0 of Devvit, we are dramatically changing the syntax of our capabilities to make development even easier. Three keys changes you’ll see:

- Moving capabilities into a context object that’s passed into handlers
- Removing the need to pass in metadata
- Renaming items for consistency

We’ve outlined the changes below.

## Menu items

Menu items have been simplified:

- `addAction` and `addActions` are now `addMenuItem`
- description has been dropped as a key
- the new context.ui shows a form or a toast instead of returns
- forms are created using Devvit.createForm
- `handler` has been renamed `onPress`
- no need to pass import-specific types:
  - context: Context.POST → location: ‘post’ or location: [‘post’, ‘comment’]
  - userContext: UserContext.Moderator → forUserType: ‘moderator’

```ts title="main.tsx"
Devvit.addMenuItem({
  label: 'Remind me later',
  location: 'post',
  onPress: (event, context) => {
    //  if you want to show a form
    context.ui.showForm(remindMeForm);

    // if you want to show a toast
    context.ui.showToast('hello');
  },
});

const remindMeForm = Devvit.createForm(
  {
    fields: [{ name: 'when', label: 'When?', type: 'string' }],
    title: 'Remind me',
    acceptLabel: 'Schedule',
  },
  remindMeHandler
);

async function remindMeHandler(event: FormOnSubmitEvent, context: Devvit.Context) {
  // remind me code here to do something after submitting form
}
```

### Dynamic forms

Because we allow data as an argument in createForm, you can now create dynamic forms.

```ts title="main.tsx"
import { Devvit } from '@devvit/public-api';

const dynamicForm = Devvit.createForm(
  (data) => {
    console.log(data);

    return {
      fields: [
        {
          name: 'when',
          label: `a string (default: ${data.text})`,
          type: 'string',
          defaultValue: data.text,
        },
      ],
      title: 'Rule Form',
      acceptLabel: 'Send Rule',
    };
  },
  ({ values }, ctx) => {
    return ctx.ui.showToast(`You sent ${values.when}`);
  }
);

Devvit.addMenuItem({
  label: 'Show a dynamic form',
  location: 'post',
  onPress: async (_, { ui }) => {
    const randomString = Math.random().toString(36).substring(7);

    const formData = {
      text: randomString,
    };

    return ui.showForm(dynamicForm, formData);
  },
});

export default Devvit;
```

## Triggers

- There's no need to pass in a specific Devvit event type: `events: Devvit.Trigger.PostSubmit` is now `event: 'PostSubmit`
- `handler` has been renamed to `onEvent`

```ts title="main.tsx"
Devvit.addTrigger({
  event: 'PostSubmit',
  onEvent: (event, context) => {
    context.scheduler.runJob({ job: test - job });
  },
});
```

## Scheduler

- Scheduler is now part of the context object
- The following have been renamed:
  - `Devvit.addSchedulerHandler` is now `Devvit.addSchedulerJob`
  - `Scheduler.schedule` is now `scheduler.runJob` and `scheduler.cancelJob`
  - `handler` is now `onRun`

```ts title="main.tsx"
Devvit.addSchedulerJob({
  name: 'daily-thread',
  onRun: async (job, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();
    const resp = await context.reddit.submitPost({
      subredditName: subreddit.name,
      title: 'Daily Thread',
      text: 'This is a daily thread, commment here!',
    });
  },
});

// run job once (within a menu item or trigger)
context.scheduler.runJob({ when: now, job: 'test-job' });

// run recurring job (within a menu item or trigger)
// for tips on cron syntax use https://crontab.guru/
context.scheduler.runJob({ cron: '* 12 * * * ', job: 'test-job' });
```

## Plugins

The Reddit API, Fetch, and KV store plugins now use `Devvit.configure` to define the capabilities you want to use (these also can be found on the context object in a handler). This replaces `Devvit.use`.

```ts title="main.tsx"
// can omit or set to false if not using
Devvit.configure({
  redditAPI: true,
  http: true, // for fetch
  kvStore: true,
});
```

Check out the following examples of the plugins in use.

### Reddit API

```ts title="main.tsx"
// can omit or set to false if not using
Devvit.configure({
  redditAPI: true,
});

Devvit.addMenuItem({
  label: 'Reply to post',
  location: 'post',
  onPress: async (event, context) => {
    const response = await context.reddit.submitComment({
      id: `t3_${context.postId}`,
      text: 'hello world!',
    });
    // if you want to show a toast
    context.ui.showToast('Successfully replied!');
  },
});

// alernative w/ deconstruction

Devvit.addMenuItem({
  label: 'Reply to post',
  location: 'post',
  onPress: (event, { reddit }) => {
    await reddit.submitComment({
      id: `t3_${context.postId}`,
      text: 'hello world!',
    });
    // if you want to show a toast
    context.ui.showToast('Successfully replied!');
  },
});
```

### Fetch

```ts title="main.tsx"
Devvit.configure({
  http: true,
});

Devvit.addMenuItem({
  label: 'Fetch a response',
  location: 'post',
  onPress: async (event, context) => {
    const response = await fetch('https://example.com', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: comment?.body }),
    });
    // if you want to show a toast
    context.ui.showToast(response);
  },
});
```

### KV store

```ts title="main.tsx"
Devvit.configure({
  kvStore: true,
});

Devvit.addMenuItem({
  label: 'Get from kv store',
  location: 'post',
  onPress: async (event, context) => {
    const value = await context.kvStore.get('test-key');
    context.ui.showToast(value);
  },
});
```

### App configurations

```ts title="main.tsx"
// set app configurations
Devvit.addSettings([
  {
    type: 'string',
    name: 'apiKey',
    label: 'API Key',
    onValidate: ({ value }) => {
      if (!value || value.length < 10) {
        return 'API Key must be at least 10 characters long';
      }
    },
  },
]);

// retreiving app configurations

Devvit.addMenuItem({
  label: 'Get settings values',
  location: 'post',
  onPress: async (event, context) => {
    console.log('event: ', event);

    const singleSetting = await context.settings.get('apiKey');
    const allSettings = await context.settings.getAll();

    console.log('All settings: ', allSettings);
    console.log('Single setting: ', singleSetting);
  },
});
```

## Installation

:::note
These syntax changes will require you to rewrite your app code.
:::

To update to this version of devvit, you should update your devvit CLI. If you want to update an existing project, you should use the command below.

To update, run the following commands:

```bash
$ npm i -g devvit
```

To update dependencies in an existing project:

```bash
$ devvit update app
```

### Moving from public-api-next

If you were using `'public-api-next'` please run the following steps in your project directory to update your app:

- `devvit update app`
- `npm remove @devvit/public-api-next`
- `npm i`
- In the app code, change `import { Devvit } from '@devvit/public-api-next';` to `import { Devvit } from '@devvit/public-api';`

## Typescript Notes

### Object deconstruction for context

Since the context object has different objects attached to it, you can use typescript deconstruction to specify the object you are looking to use to simplify code.

```ts title="main.tsx"
// alernative w/ deconstruction
Devvit.addMenuItem({
  label: 'Reply to post',
  location: 'post',
  onPress: (event, { reddit, ui }) => {
    await reddit.submitComment({
      id: `t3_${context.postId}`,
      text: 'hello world!',
    });
    // if you want to show a toast
    ui.showToast('Successfully replied!');
  },
});
```

### \_ argument

In some examples above, we are prefixing `_` in front of the argument, this avoids typecheck error for unused variables, but is not necessary.
