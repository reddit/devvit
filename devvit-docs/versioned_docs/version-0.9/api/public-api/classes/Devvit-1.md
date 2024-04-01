# Class: Devvit

Devvit's non-class-based API for Bundle programs. Bundles are expected to
reexport their Devvit singleton. Config state is retained statically so that
when a Bundle exports their static instance of Devvit, its constructor can
populate the passed in Config with that static state.

For the class API, see Actor.

## Hierarchy

- `Actor`

  ↳ **`Devvit`**

## Table of contents

### Constructors

- [constructor](Devvit-1.md#constructor)

### Properties

- [ContextAction](Devvit-1.md#contextaction)
- [KVStore](Devvit-1.md#kvstore)
- [SchedulerHandler](Devvit-1.md#schedulerhandler)
- [Types](Devvit-1.md#types)
- [UserConfigurable](Devvit-1.md#userconfigurable)

### Methods

- [addAction](Devvit-1.md#addaction)
- [addActions](Devvit-1.md#addactions)
- [addSchedulerHandler](Devvit-1.md#addschedulerhandler)
- [addTrigger](Devvit-1.md#addtrigger)
- [getApiClient](Devvit-1.md#getapiclient)
- [onAppInstall](Devvit-1.md#onappinstall)
- [onAppUpgrade](Devvit-1.md#onappupgrade)
- [onCommentReport](Devvit-1.md#oncommentreport)
- [onCommentSubmit](Devvit-1.md#oncommentsubmit)
- [onCommentUpdate](Devvit-1.md#oncommentupdate)
- [onPostReport](Devvit-1.md#onpostreport)
- [onPostSubmit](Devvit-1.md#onpostsubmit)
- [onPostUpdate](Devvit-1.md#onpostupdate)
- [onSubredditSubscribe](Devvit-1.md#onsubredditsubscribe)
- [use](Devvit-1.md#use)

## Constructors

### constructor

• **new Devvit**(`cfg`)

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `cfg` | `Config` |

#### Overrides

Actor.constructor

## Properties

### ContextAction

▪ `Static` **ContextAction**: `Object`

#### Type declaration

| Name           | Type                                                                                                                                                                                                                                                                                                                                                                                                |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onAction`     | (`cb`: (`args`: `ContextActionRequest`, `metadata?`: `Metadata`) => `Promise`\< \{ `message?`: `string` ; `success?`: `boolean` }\>) => `void`                                                                                                                                                                                                                                                      |
| `onGetActions` | (`cb`: (`_?`: `Empty`, `metadata?`: `Metadata`) => `Promise`\< \{ `actions?`: \{ actionId?: string \| undefined; name?: string \| undefined; description?: string \| undefined; contexts?: \{ post?: boolean \| undefined; comment?: boolean \| undefined; subreddit?: boolean \| undefined; } \| undefined; users?: \{ ...; } \| undefined; userInput?: \{ ...; } \| undefined; }[] }\>) => `void` |

---

### KVStore

▪ `Static` **KVStore**: `Object`

#### Type declaration

| Name     | Type                                                                                                                                    |
| :------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `onDel`  | (`cb`: (`args`: `KeySet`, `metadata?`: `Metadata`) => `Promise`\< `void`\>) => `void`                                                   |
| `onGet`  | (`cb`: (`args`: `KeySet`, `metadata?`: `Metadata`) => `Promise`\< \{ `messages?`: \{ [x: string]: string \| undefined; } }\>) => `void` |
| `onList` | (`cb`: (`args`: `ListFilter`, `metadata?`: `Metadata`) => `Promise`\< \{ `keys?`: `string`[] }\>) => `void`                             |
| `onPut`  | (`cb`: (`args`: `MessageSet`, `metadata?`: `Metadata`) => `Promise`\< `void`\>) => `void`                                               |

---

### SchedulerHandler

▪ `Static` **SchedulerHandler**: `Object`

#### Type declaration

| Name                      | Type                                                                                           |
| :------------------------ | :--------------------------------------------------------------------------------------------- |
| `onHandleScheduledAction` | (`cb`: (`args`: `ScheduledAction`, `metadata?`: `Metadata`) => `Promise`\< `void`\>) => `void` |

---

### Types

▪ `Static` **Types**: `Readonly`\< \{ `ContextAction`: `BoundType`\< `ContextAction`\> ; `HTTP`: `BoundType`\< `HTTP`\> ; `KVStore`: `BoundType`\< `KVStore`\> ; `Logger`: `BoundType`\< `Logger`\> ; `OnAppInstall`: `BoundType`\< `OnAppInstall`\> ; `OnAppUpgrade`: `BoundType`\< `OnAppUpgrade`\> ; `OnCommentReport`: `BoundType`\< `OnCommentReport`\> ; `OnCommentSubmit`: `BoundType`\< `OnCommentSubmit`\> ; `OnCommentUpdate`: `BoundType`\< `OnCommentUpdate`\> ; `OnPostReport`: `BoundType`\< `OnPostReport`\> ; `OnPostSubmit`: `BoundType`\< `OnPostSubmit`\> ; `OnPostUpdate`: `BoundType`\< `OnPostUpdate`\> ; `OnSubredditSubscribe`: `BoundType`\< `OnSubredditSubscribe`\> ; `RedditAPI`: \{ `Flair`: `BoundType`\< `Flair`\> ; `LinksAndComments`: `BoundType`\< `LinksAndComments`\> ; `Listings`: `BoundType`\< `Listings`\> ; `ModNote`: `BoundType`\< `ModNote`\> ; `Moderation`: `BoundType`\< `Moderation`\> ; `NewModmail`: `BoundType`\< `NewModmail`\> ; `PrivateMessages`: `BoundType`\< `PrivateMessages`\> ; `Subreddits`: `BoundType`\< `Subreddits`\> ; `Users`: `BoundType`\< `Users`\> ; `Widgets`: `BoundType`\< `Widgets`\> ; `Wiki`: `BoundType`\< `Wiki`\> } ; `Scheduler`: `BoundType`\< `Scheduler`\> ; `SchedulerHandler`: `BoundType`\< `SchedulerHandler`\> ; `Timer`: `BoundType`\< `Timer`\> ; `UserConfigurable`: `BoundType`\< `UserConfigurable`\> }\>

---

### UserConfigurable

▪ `Static` **UserConfigurable**: `Object`

#### Type declaration

| Name                   | Type                                                                                                                                                                                                                                  |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onHandleFormResponse` | (`cb`: (`args`: `ConfigForm`, `metadata?`: `Metadata`) => `Promise`\< \{ `messages?`: `string`[] ; `success?`: `boolean` }\>) => `void`                                                                                               |
| `onRenderForm`         | (`cb`: (`_?`: `Empty`, `metadata?`: `Metadata`) => `Promise`\< \{ `fields?`: \{ fieldType?: ConfigFieldType \| undefined; key?: string \| undefined; prompt?: string \| undefined; response?: string \| undefined; }[] }\>) => `void` |

## Methods

### addAction

▸ `Static` **addAction**(`contextAction`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name            | Type                                          |
| :-------------- | :-------------------------------------------- |
| `contextAction` | [`ContextAction`](../README.md#contextaction) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

▸ `Static` **addAction**(`contextAction`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name            | Type                                                    |
| :-------------- | :------------------------------------------------------ |
| `contextAction` | [`MultiContextAction`](../README.md#multicontextaction) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

---

### addActions

▸ `Static` **addActions**(`contextActions`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name             | Type                                                                                                         |
| :--------------- | :----------------------------------------------------------------------------------------------------------- |
| `contextActions` | ([`MultiContextAction`](../README.md#multicontextaction) \| [`ContextAction`](../README.md#contextaction))[] |

#### Returns

typeof [`Devvit`](Devvit-1.md)

---

### addSchedulerHandler

▸ `Static` **addSchedulerHandler**(`schedulerHandler`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name               | Type                                                |
| :----------------- | :-------------------------------------------------- |
| `schedulerHandler` | [`SchedulerHandler`](../README.md#schedulerhandler) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

---

### addTrigger

▸ `Static` **addTrigger**(`config`): typeof [`Devvit`](Devvit-1.md)

Add a trigger handler that will be invoked when the given event
happens in subreddit the in which the app is installed.

**`Example`**

```ts
import Devvit from '@devvit/public-api';
Devvit.addTrigger({
  event: Devvit.Trigger.PostSubmit,
  handler(postSubmitEvent) {
    console.log('a new post was created!');
  },
});

import Devvit from '@devvit/public-api';
Devvit.addTrigger({
  events: [Devvit.Trigger.PostSubmit, Devvit.Trigger.PostReport],
  handler(event) {
    if (event.type === Devvit.Trigger.PostSubmit) {
      console.log('a new post was created!');
    } else if (event.type === Devvit.Trigger.PostReport) {
      console.log('a post was reported!');
    }
  },
});
```

#### Parameters

| Name     | Type                                                        | Description                                                    |
| :------- | :---------------------------------------------------------- | :------------------------------------------------------------- |
| `config` | [`PostSubmitConfig`](../modules/Devvit.md#postsubmitconfig) | \{Devvit.TriggerConfig} the configuration of the added trigger |

#### Returns

typeof [`Devvit`](Devvit-1.md)

▸ `Static` **addTrigger**(`config`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name     | Type                                                        |
| :------- | :---------------------------------------------------------- |
| `config` | [`PostUpdateConfig`](../modules/Devvit.md#postupdateconfig) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

▸ `Static` **addTrigger**(`config`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name     | Type                                                        |
| :------- | :---------------------------------------------------------- |
| `config` | [`PostReportConfig`](../modules/Devvit.md#postreportconfig) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

▸ `Static` **addTrigger**(`config`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name     | Type                                                              |
| :------- | :---------------------------------------------------------------- |
| `config` | [`CommentSubmitConfig`](../modules/Devvit.md#commentsubmitconfig) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

▸ `Static` **addTrigger**(`config`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name     | Type                                                              |
| :------- | :---------------------------------------------------------------- |
| `config` | [`CommentUpdateConfig`](../modules/Devvit.md#commentupdateconfig) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

▸ `Static` **addTrigger**(`config`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name     | Type                                                              |
| :------- | :---------------------------------------------------------------- |
| `config` | [`CommentReportConfig`](../modules/Devvit.md#commentreportconfig) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

▸ `Static` **addTrigger**(`config`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name     | Type                                                                        |
| :------- | :-------------------------------------------------------------------------- |
| `config` | [`SubredditSubscribeConfig`](../modules/Devvit.md#subredditsubscribeconfig) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

▸ `Static` **addTrigger**(`config`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name     | Type                                                        |
| :------- | :---------------------------------------------------------- |
| `config` | [`AppInstallConfig`](../modules/Devvit.md#appinstallconfig) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

▸ `Static` **addTrigger**(`config`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name     | Type                                                        |
| :------- | :---------------------------------------------------------- |
| `config` | [`AppUpgradeConfig`](../modules/Devvit.md#appupgradeconfig) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

▸ `Static` **addTrigger**(`config`): typeof [`Devvit`](Devvit-1.md)

#### Parameters

| Name     | Type                                                            |
| :------- | :-------------------------------------------------------------- |
| `config` | [`MultiTriggerConfig`](../modules/Devvit.md#multitriggerconfig) |

#### Returns

typeof [`Devvit`](Devvit-1.md)

---

### getApiClient

▸ `Static` **getApiClient**\< `T`\>(`type`): `T`

#### Type parameters

| Name | Type                |
| :--- | :------------------ |
| `T`  | extends `ActorType` |

#### Parameters

| Name   | Type                |
| :----- | :------------------ |
| `type` | `BoundType`\< `T`\> |

#### Returns

`T`

---

### onAppInstall

▸ `Static` **onAppInstall**(`cb`): `void`

#### Parameters

| Name | Type                                                                 |
| :--- | :------------------------------------------------------------------- |
| `cb` | (`args`: `AppInstall`, `metadata?`: `Metadata`) => `Promise`\< \{}\> |

#### Returns

`void`

---

### onAppUpgrade

▸ `Static` **onAppUpgrade**(`cb`): `void`

#### Parameters

| Name | Type                                                                 |
| :--- | :------------------------------------------------------------------- |
| `cb` | (`args`: `AppUpgrade`, `metadata?`: `Metadata`) => `Promise`\< \{}\> |

#### Returns

`void`

---

### onCommentReport

▸ `Static` **onCommentReport**(`cb`): `void`

#### Parameters

| Name | Type                                                                    |
| :--- | :---------------------------------------------------------------------- |
| `cb` | (`args`: `CommentReport`, `metadata?`: `Metadata`) => `Promise`\< \{}\> |

#### Returns

`void`

---

### onCommentSubmit

▸ `Static` **onCommentSubmit**(`cb`): `void`

#### Parameters

| Name | Type                                                                    |
| :--- | :---------------------------------------------------------------------- |
| `cb` | (`args`: `CommentSubmit`, `metadata?`: `Metadata`) => `Promise`\< \{}\> |

#### Returns

`void`

---

### onCommentUpdate

▸ `Static` **onCommentUpdate**(`cb`): `void`

#### Parameters

| Name | Type                                                                    |
| :--- | :---------------------------------------------------------------------- |
| `cb` | (`args`: `CommentUpdate`, `metadata?`: `Metadata`) => `Promise`\< \{}\> |

#### Returns

`void`

---

### onPostReport

▸ `Static` **onPostReport**(`cb`): `void`

#### Parameters

| Name | Type                                                                 |
| :--- | :------------------------------------------------------------------- |
| `cb` | (`args`: `PostReport`, `metadata?`: `Metadata`) => `Promise`\< \{}\> |

#### Returns

`void`

---

### onPostSubmit

▸ `Static` **onPostSubmit**(`cb`): `void`

#### Parameters

| Name | Type                                                                 |
| :--- | :------------------------------------------------------------------- |
| `cb` | (`args`: `PostSubmit`, `metadata?`: `Metadata`) => `Promise`\< \{}\> |

#### Returns

`void`

---

### onPostUpdate

▸ `Static` **onPostUpdate**(`cb`): `void`

#### Parameters

| Name | Type                                                                 |
| :--- | :------------------------------------------------------------------- |
| `cb` | (`args`: `PostUpdate`, `metadata?`: `Metadata`) => `Promise`\< \{}\> |

#### Returns

`void`

---

### onSubredditSubscribe

▸ `Static` **onSubredditSubscribe**(`cb`): `void`

#### Parameters

| Name | Type                                                                         |
| :--- | :--------------------------------------------------------------------------- |
| `cb` | (`args`: `SubredditSubscribe`, `metadata?`: `Metadata`) => `Promise`\< \{}\> |

#### Returns

`void`

---

### use

▸ `Static` **use**\< `T`\>(`type`, `opts?`): `T`

#### Type parameters

| Name | Type                |
| :--- | :------------------ |
| `T`  | extends `ActorType` |

#### Parameters

| Name             | Type                | Description                                                                                       |
| :--------------- | :------------------ | :------------------------------------------------------------------------------------------------ |
| `type`           | `BoundType`\< `T`\> | -                                                                                                 |
| `opts?`          | `Object`            | -                                                                                                 |
| `opts.name?`     | `string`            | Limit resolution to a Bundle or plugins (PLUGIN_APP_NAME). Eg, com.devvit.example/foo.            |
| `opts.owner?`    | `string`            | Limit resolution to owner. Eg, com.reddit.                                                        |
| `opts.typeName?` | `string`            | Limit resolution to type. No slashes. Eg, "devvit.plugin.logger.Logger". See Definition.fullName. |
| `opts.versions?` | `string`            | Limit resolution to versions. Eg, ">=0" or "1.0.0".                                               |

#### Returns

`T`
