## ActionToolbarWrapper
A simple developer toolbar for your app.

### Step 1: Import the `ActionToolbarWrapper` component
Add the line `import { ActionToolbarWrapper } from '@devvit/kit';` in the beginning of your root component.

### Step 2: Wrap your root component with the ActionToolbarWrapper element
Before you add the toolbar, your root component might look like this:
```typescript jsx
return (
    <hstack width={100} height={100}>
      ...
    </hstack>
);
```
Wrap the `ActionToolbarWrapper` around the top element of your root component, like this: 

```typescript jsx
return (
    <ActionToolbarWrapper context={context} allowedUserString="*">
        <hstack width={100} height={100}>
          ...
        </hstack>
    </ActionToolbarWrapper>
);
```

### Step 3: Create toolbar actions
A toolbar action is a simple object containing a function that is executed on click.
To create a ToolbarAction you need to import the `devAction` utility first.

Update the import line from Step 1 to be `import { ActionToolbarWrapper, devAction } from '@devvit/kit';`. 

Now you can define actions in your root component. This happens in two parts: creating the action and passing the action to the `ActionToolbarWrapper`.

Here's an example of how to create an action that reveals the post id:
```typescript
  const revealPostId = devAction('Reveal Post Id', ()=>{
  const postId = context.postId;
  context.ui.showToast(String(postId));
})
```

Next, pass this action to the `ActionToolbarWrapper`.
```typescript jsx
return (
    <ActionToolbarWrapper context={context} allowedUserString="*" actions={[revealPostId]}>
        ...
    </ActionToolbarWrapper>
);
```

Now you can use this action in the toolbar.

### Step 4: Configure toolbar visibility
`allowedUserString` is a parameter that restricts the toolbar visibility to certain users. 
Toolbar visibility can be defined in the toolbar or in the app settings. 

**Using the toolbar**

In Step 2, you used `allowedUserString="*"`, where `"*"` means **everyone**.
If you want only certain users to see the toolbar, just write their usernames in the `allowedUserString` separated by space. For users `user_foo` and `bar_user` the user string would look like `"user_foo bar_user"`.

**Using app settings**
First, add `getAllowedUsers` to the import line.

```typescript
import { ActionToolbarWrapper, devAction, getAllowedUsers } from '@devvit/kit';
```

Next, fetch the value from settings in your root component.
```typescript
const [allowedUsersFromSettings] = config.context.useState<string>(
  async () => await getAllowedUsers(config.context.settings)
);
```

Finally, update the `allowedUserString` parameter to be `allowedUsersFromSettings`.
```typescript jsx
<ActionToolbarWrapper context={context} allowedUserString={allowedUsersFromSettings} actions={[revealPostId]}>
```
