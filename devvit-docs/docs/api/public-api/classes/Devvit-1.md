# Class: Devvit

## Hierarchy

- `Actor`

  ↳ **`Devvit`**

## Table of contents

### Properties

- [debug](Devvit-1.md#debug)

### Methods

- [addCustomPostType](Devvit-1.md#addcustomposttype)
- [addMenuItem](Devvit-1.md#addmenuitem)
- [addSchedulerJob](Devvit-1.md#addschedulerjob)
- [addSettings](Devvit-1.md#addsettings)
- [addTrigger](Devvit-1.md#addtrigger)
- [configure](Devvit-1.md#configure)
- [createForm](Devvit-1.md#createform)

## Properties

### <a id="debug" name="debug"></a> debug

▪ `Static` **debug**: [`DevvitDebug`](../README.md#devvitdebug) = `{}`

## Methods

### <a id="addcustomposttype" name="addcustomposttype"></a> addCustomPostType

▸ **addCustomPostType**(`customPostType`): `void`

Add a custom post type for your app.

#### Parameters

| Name             | Type                                            | Description                  |
| :--------------- | :---------------------------------------------- | :--------------------------- |
| `customPostType` | [`CustomPostType`](../README.md#customposttype) | The custom post type to add. |

#### Returns

`void`

**`Example`**

```ts
import { Devvit, useState } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Counter',
  description: 'A simple click counter post.',
  render: (context) => {
    const [counter, setCounter] = useState();

    return (
      <vstack>
        <text>{counter}</text>
        <button onPress={() => setCounter((counter) => counter + 1)}>Click me!</button>
      </vstack>
    );
  },
});
```

---

### <a id="addmenuitem" name="addmenuitem"></a> addMenuItem

▸ **addMenuItem**(`menuItem`): `void`

Add a menu item to the Reddit UI.

#### Parameters

| Name       | Type                                | Description           |
| :--------- | :---------------------------------- | :-------------------- |
| `menuItem` | [`MenuItem`](../README.md#menuitem) | The menu item to add. |

#### Returns

`void`

**`Example`**

```ts
Devvit.addMenuItem({
  label: 'My Menu Item',
  location: 'subreddit',
  onPress: (event, context) => {
    const location = event.location;
    const targetId = event.targetId;
    context.ui.showToast(`You clicked on ${location} ${targetId}`);
  },
});
```

---

### <a id="addschedulerjob" name="addschedulerjob"></a> addSchedulerJob

▸ **addSchedulerJob**\<`T`\>(`job`): `void`

Add a scheduled job type for your app. This will allow you to schedule jobs using the `scheduler` API.

#### Type parameters

| Name | Type                                                           |
| :--- | :------------------------------------------------------------- |
| `T`  | extends `undefined` \| [`JSONObject`](../README.md#jsonobject) |

#### Parameters

| Name  | Type                                                       | Description                    |
| :---- | :--------------------------------------------------------- | :----------------------------- |
| `job` | [`ScheduledJobType`](../README.md#scheduledjobtype)\<`T`\> | The scheduled job type to add. |

#### Returns

`void`

**`Example`**

```ts
Devvit.addSchedulerJob({
  name: 'checkNewPosts',
  onRun: async (event, context) => {
    const newPosts = await context.reddit.getNewPosts({ limit: 5 }).all();
    for (const post of newPosts) {
      if (post.title.includes('bad word')) {
        await post.remove();
      }
    }
  }
});

Devvit.addMenuItem({
  label: 'Check for new posts',
  location: 'location',
  onPress: (event, context) => {
    const = await context.scheduler.runJob({
      name: 'checkNewPosts',
      when: new Date(Date.now() + 5000) // in 5 seconds
    });
  }
});
```

---

### <a id="addsettings" name="addsettings"></a> addSettings

▸ **addSettings**(`fields`): `void`

Add settings that can be configured to customize the behavior of your app. There are two levels of settings: App settings (scope: 'app') and
install settings (scope: 'installation' or unspecified scope). Install settings are meant to be configured by the user that installs your app.
This is a good place to add anything that a user might want to change to personalize the app (e.g. the default city to show the weather for or a
specific sport team that a subreddit follows). Note that these are good for subreddit level customization but not necessarily good for things
that might be different for two users in a subreddit (e.g. setting the default city to show the weather for is only useful at a sub level if
the sub is for a specific city or region). Install settings can be viewed and configured here: https://developers.reddit.com/r/subreddit-name/apps/app-name.
App settings can be accessed and consumed by all installations of the app. This is mainly useful for developer secrets/API keys that your
app needs to function. They can only be changed/viewed by you via the CLI (devvit settings set and devvit settings list). This ensures secrets
are persisted in an encrypted store and don't get committed in the source code. You should never paste your actual key into any fields passed into
Devvit.addSettings - this is merely where you state what your API key's name and description are. You will be able to set the actual value of the key via CLI.
Note: setting names must be unique across all settings.

#### Parameters

| Name     | Type                                                    | Description                                   |
| :------- | :------------------------------------------------------ | :-------------------------------------------- |
| `fields` | [`SettingsFormField`](../README.md#settingsformfield)[] | Fields for the app and installation settings. |

#### Returns

`void`

**`Example`**

```ts
Devvit.addSettings([
  {
    type: 'string',
    name: 'weather-api-key',
    label: 'My weather.com API key',
    scope: SettingScope.App,
    isSecret: true,
  },
  {
    type: 'string',
    name: 'Default City',
    label: 'Default city to show the weather for by default',
    scope: SettingScope.Installation,
    onValidate: ({ value }) => {
      if (!isValidCity(value)) {
        return 'You must ender a valid city: ${validCities.join(", ")}';
      }
    },
  },
  {
    type: 'number',
    name: 'Default Forecast Window (in days)',
    label: 'The number of days to show for forecast for by default',
    scope: SettingScope.Installation,
    onValidate: ({ value }) => {
      if (value > 10 || value < 1) {
        return 'Forecast window must be from 1 to 10 days';
      }
    },
  },
]);
```

---

### <a id="addtrigger" name="addtrigger"></a> addTrigger

▸ **addTrigger**\<`T`\>(`definition`): typeof [`Devvit`](../modules/Devvit.md)

Add a trigger handler that will be invoked when the given event
occurs in a subreddit where the app is installed.

#### Type parameters

| Name | Type                                                              |
| :--- | :---------------------------------------------------------------- |
| `T`  | extends keyof [`TriggerEventType`](../README.md#triggereventtype) |

#### Parameters

| Name                 | Type                                                                                                                      |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `definition`         | `Object`                                                                                                                  |
| `definition.event`   | `T`                                                                                                                       |
| `definition.onEvent` | [`TriggerOnEventHandler`](../README.md#triggeroneventhandler)\<[`TriggerEventType`](../README.md#triggereventtype)[`T`]\> |

#### Returns

typeof [`Devvit`](../modules/Devvit.md)

**`Example`**

```ts
Devvit.addTrigger({
  event: 'PostSubmit',
  async onEvent(event, context) {
    console.log('a new post was created!');
  },
});

Devvit.addTrigger({
  events: ['PostSubmit', 'PostReport'],
  async onEvent(event, context) {
    if (event.type === 'PostSubmit') {
      console.log('a new post was created!');
    } else if (event.type === 'PostReport') {
      console.log('a post was reported!');
    }
  },
});
```

▸ **addTrigger**\<`Event`\>(`triggerDefinition`): typeof [`Devvit`](../modules/Devvit.md)

#### Type parameters

| Name    | Type                                                |
| :------ | :-------------------------------------------------- |
| `Event` | extends [`TriggerEvent`](../README.md#triggerevent) |

#### Parameters

| Name                | Type                                                                       |
| :------------------ | :------------------------------------------------------------------------- |
| `triggerDefinition` | [`MultiTriggerDefinition`](../README.md#multitriggerdefinition)\<`Event`\> |

#### Returns

typeof [`Devvit`](../modules/Devvit.md)

---

### <a id="configure" name="configure"></a> configure

▸ **configure**(`config`): `void`

To use certain APIs and features of Devvit, you must enable them using this function.

#### Parameters

| Name     | Type                                          | Description               |
| :------- | :-------------------------------------------- | :------------------------ |
| `config` | [`Configuration`](../README.md#configuration) | The configuration object. |

#### Returns

`void`

**`Example`**

```ts
Devvit.configure({
  http: true,
  redditAPI: true,
  redis: true,
  media: true,
});
```

---

### <a id="createform" name="createform"></a> createForm

▸ **createForm**\<`T`\>(`form`, `onSubmit`): [`FormKey`](../README.md#formkey)

Create a form that can be opened from menu items and custom posts.

#### Type parameters

| Name | Type                                                                               |
| :--- | :--------------------------------------------------------------------------------- |
| `T`  | extends [`Form`](../README.md#form) \| [`FormFunction`](../README.md#formfunction) |

#### Parameters

| Name       | Type                                                                                                                              | Description                                      |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| `form`     | `T`                                                                                                                               | The form or a function that returns the form.    |
| `onSubmit` | [`FormOnSubmitEventHandler`](../README.md#formonsubmiteventhandler)\<[`FormToFormValues`](../README.md#formtoformvalues)\<`T`\>\> | The function to call when the form is submitted. |

#### Returns

[`FormKey`](../README.md#formkey)

A unique key for the form that can used with `ui.showForm`.
