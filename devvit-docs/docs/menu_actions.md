# Menu actions

Add an item to the three dot menu.

You can add custom menu actions to posts and comments using the Devvit.addMenuItem() function.

:::note
On new Reddit, comment menu actions in modqueue are only available in card view.
:::

![custom menu actions](./assets/custom_menu_actions.png)

## Supported Contexts

The context lets you define where the menu action shows up. The options for `location` are:

- "comment"
- "post"
- "subreddit"

There is a `postFilter` (optional) property that you can use to only show "post" actions on posts that satisfy the criteria.

For example, you can use the `"currentApp"` filter to only display the menu item on [custom posts](./custom_post_usage.md) that were created by your app.

You can also define the `forUserType` (optional) to specify the types of users that can see the menu action. The options are:

- "moderator"

(More `forUserType` options are coming soon!)

## Limitations

- If there are multiple apps, there is no way to sort order of actions in the menu.
- The context, name, and description fields do not support dynamic logic.

## Example

Here you'll use `Devvit.addMenuItem` to create a menu actions for comments, posts and subreddits.

```ts
import { Devvit } from '@devvit/public-api';

// Declare multiple actions to be added to the menu
Devvit.addMenuItem({
  label: 'Say Hello',
  location: 'post', // accepts 'post', 'comment', 'subreddit', or a combination as an array
  forUserType: 'moderator', // restricts this action to moderators, leave blank for any user
  onPress: (event, context) => {
    context.ui.showToast(`Hello from a ${event.location}!`);
  },
});
```

## Dynamic Forms

You can create dynamic form by passing in a data object as the 2nd argument into `ui.showForm`. Once data is passed in you can access it from the createForm function.

The example below includes a random string into the label of the form field:

```ts
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
  onPress: async (_event, { ui }) => {
    const randomString = Math.random().toString(36).substring(7);

    const formData = {
      text: randomString,
    };

    return ui.showForm(dynamicForm, formData);
  },
});

export default Devvit;
```
