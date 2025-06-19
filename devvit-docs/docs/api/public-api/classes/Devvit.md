[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Class: Devvit

## Extends

- `Actor`

## Properties

<a id="debug"></a>

### debug

> `static` **debug**: [`DevvitDebug`](../type-aliases/DevvitDebug.md) = `{}`

## Methods

<a id="addcustomposttype"></a>

### addCustomPostType()

> `static` **addCustomPostType**(`customPostType`): `void`

Add a custom post type for your app.

#### Parameters

##### customPostType

[`CustomPostType`](../type-aliases/CustomPostType.md)

The custom post type to add.

#### Returns

`void`

#### Example

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

<a id="addmenuitem"></a>

### addMenuItem()

> `static` **addMenuItem**(`menuItem`): `void`

Add a menu item to the Reddit UI.

#### Parameters

##### menuItem

[`MenuItem`](../type-aliases/MenuItem.md)

The menu item to add.

#### Returns

`void`

#### Example

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

<a id="addschedulerjob"></a>

### addSchedulerJob()

> `static` **addSchedulerJob**\<`T`\>(`job`): `void`

Add a scheduled job type for your app. This will allow you to schedule jobs using the `scheduler` API.

#### Type Parameters

##### T

`T` _extends_ `undefined` \| [`JSONObject`](../type-aliases/JSONObject.md)

#### Parameters

##### job

[`ScheduledJobType`](../type-aliases/ScheduledJobType.md)\<`T`\>

The scheduled job type to add.

#### Returns

`void`

#### Example

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

<a id="addsettings"></a>

### addSettings()

> `static` **addSettings**(`fields`): `void`

Add settings that can be configured to customize the behavior of your app.

There are two levels of settings:

- App settings (scope: 'app')
- Installation settings (scope: 'installation' or unspecified scope).

Installation settings are meant to be configured by the user that installs your app.
This is a good place to add anything that a user might want to change to personalize the app (e.g. the default city to show the weather for or a
specific sport team that a subreddit follows). Note that these are good for subreddit level customization but not necessarily good for things
that might be different for two users in a subreddit (e.g. setting the default city to show the weather for is only useful at a sub level if
the sub is for a specific city or region).
Installation settings can be viewed and configured here: https://developers.reddit.com/r/subreddit-name/apps/app-name.

App settings can be accessed and consumed by all installations of the app. This is mainly useful for developer secrets/API keys that your
app needs to function. They can only be changed/viewed by you via the CLI (devvit settings set and devvit settings list). This ensures secrets
are persisted in an encrypted store and don't get committed in the source code.

Warning: You should never paste your actual key into any fields passed into Devvit.addSettings - this is merely where you state what your API key's name and description are. You will be able to set the actual value of the key via CLI.

Note: setting names must be unique across all settings.

#### Parameters

##### fields

Fields for the app and installation settings.

[`SettingsFormField`](../type-aliases/SettingsFormField.md) | [`SettingsFormField`](../type-aliases/SettingsFormField.md)[]

#### Returns

`void`

#### Examples

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

```ts
Devvit.addSettings({
  type: 'string',
  name: 'weather-api-key',
  label: 'My weather.com API key',
  scope: SettingScope.App,
  isSecret: true,
});
```

---

<a id="addtrigger"></a>

### addTrigger()

#### Call Signature

> `static` **addTrigger**\<`T`\>(`definition`): _typeof_ [`Devvit`](../@devvit/namespaces/Devvit/README.md)

Add a trigger handler that will be invoked when the given event
occurs in a subreddit where the app is installed.

##### Type Parameters

###### T

`T` _extends_ keyof [`TriggerEventType`](../type-aliases/TriggerEventType.md)

##### Parameters

###### definition

###### event

`T`

###### onEvent

[`TriggerOnEventHandler`](../type-aliases/TriggerOnEventHandler.md)\<[`TriggerEventType`](../type-aliases/TriggerEventType.md)\[`T`\]\>

##### Returns

_typeof_ [`Devvit`](../@devvit/namespaces/Devvit/README.md)

##### Example

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

#### Call Signature

> `static` **addTrigger**\<`Event`\>(`triggerDefinition`): _typeof_ [`Devvit`](../@devvit/namespaces/Devvit/README.md)

Add a trigger handler that will be invoked when the given event
occurs in a subreddit where the app is installed.

##### Type Parameters

###### Event

`Event` _extends_ [`TriggerEvent`](../type-aliases/TriggerEvent.md)

##### Parameters

###### triggerDefinition

[`MultiTriggerDefinition`](../type-aliases/MultiTriggerDefinition.md)\<`Event`\>

The trigger definition.

##### Returns

_typeof_ [`Devvit`](../@devvit/namespaces/Devvit/README.md)

##### Example

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

---

<a id="configure"></a>

### configure()

> `static` **configure**(`config`): `void`

To use certain APIs and features of Devvit, you must enable them using this function.

#### Parameters

##### config

[`Configuration`](../type-aliases/Configuration.md)

The configuration object.

#### Returns

`void`

#### Example

```ts
Devvit.configure({
  http: true,
  redditAPI: true,
  redis: true,
  media: true,
});
```

---

<a id="createform"></a>

### createForm()

> `static` **createForm**\<`T`\>(`form`, `onSubmit`): [`FormKey`](../type-aliases/FormKey.md)

Create a form that can be opened from menu items and custom posts.

#### Type Parameters

##### T

`T` _extends_ [`Form`](../type-aliases/Form.md) \| [`FormFunction`](../type-aliases/FormFunction.md)

#### Parameters

##### form

`T`

The form or a function that returns the form.

##### onSubmit

[`FormOnSubmitEventHandler`](../type-aliases/FormOnSubmitEventHandler.md)\<[`FormToFormValues`](../type-aliases/FormToFormValues.md)\<`T`\>\>

The function to call when the form is submitted.

#### Returns

[`FormKey`](../type-aliases/FormKey.md)

A unique key for the form that can used with `ui.showForm`.
