# Namespace: Devvit

## Table of contents

### Enumerations

- [Trigger](../enums/Devvit.Trigger.md)

### Type Aliases

- [AppInstallConfig](Devvit.md#appinstallconfig)
- [AppUpgradeConfig](Devvit.md#appupgradeconfig)
- [CommentReportConfig](Devvit.md#commentreportconfig)
- [CommentSubmitConfig](Devvit.md#commentsubmitconfig)
- [CommentUpdateConfig](Devvit.md#commentupdateconfig)
- [MultiTriggerConfig](Devvit.md#multitriggerconfig)
- [MultiTriggerEvent](Devvit.md#multitriggerevent)
- [PostReportConfig](Devvit.md#postreportconfig)
- [PostSubmitConfig](Devvit.md#postsubmitconfig)
- [PostUpdateConfig](Devvit.md#postupdateconfig)
- [SubredditSubscribeConfig](Devvit.md#subredditsubscribeconfig)
- [TriggerConfig](Devvit.md#triggerconfig)

## Type Aliases

### AppInstallConfig

Ƭ **AppInstallConfig**: `Object`

#### Type declaration

| Name      | Type                                                  |
| :-------- | :---------------------------------------------------- |
| `event`   | [`AppInstall`](../enums/Devvit.Trigger.md#appinstall) |
| `handler` | `Handler`\< `AppInstall`\>                            |

---

### AppUpgradeConfig

Ƭ **AppUpgradeConfig**: `Object`

#### Type declaration

| Name      | Type                                                  |
| :-------- | :---------------------------------------------------- |
| `event`   | [`AppUpgrade`](../enums/Devvit.Trigger.md#appupgrade) |
| `handler` | `Handler`\< `AppUpgrade`\>                            |

---

### CommentReportConfig

Ƭ **CommentReportConfig**: `Object`

#### Type declaration

| Name      | Type                                                        |
| :-------- | :---------------------------------------------------------- |
| `event`   | [`CommentReport`](../enums/Devvit.Trigger.md#commentreport) |
| `handler` | `Handler`\< `CommentReport`\>                               |

---

### CommentSubmitConfig

Ƭ **CommentSubmitConfig**: `Object`

#### Type declaration

| Name      | Type                                                        |
| :-------- | :---------------------------------------------------------- |
| `event`   | [`CommentSubmit`](../enums/Devvit.Trigger.md#commentsubmit) |
| `handler` | `Handler`\< `CommentSubmit`\>                               |

---

### CommentUpdateConfig

Ƭ **CommentUpdateConfig**: `Object`

#### Type declaration

| Name      | Type                                                        |
| :-------- | :---------------------------------------------------------- |
| `event`   | [`CommentUpdate`](../enums/Devvit.Trigger.md#commentupdate) |
| `handler` | `Handler`\< `CommentUpdate`\>                               |

---

### MultiTriggerConfig

Ƭ **MultiTriggerConfig**: `Object`

#### Type declaration

| Name      | Type                                                             |
| :-------- | :--------------------------------------------------------------- |
| `events`  | [`Trigger`](../enums/Devvit.Trigger.md)[]                        |
| `handler` | `Handler`\< [`MultiTriggerEvent`](Devvit.md#multitriggerevent)\> |

---

### MultiTriggerEvent

Ƭ **MultiTriggerEvent**: \{ `event`: `PostSubmit` ; `type`: [`PostSubmit`](../enums/Devvit.Trigger.md#postsubmit) } \| \{ `event`: `PostUpdate` ; `type`: [`PostUpdate`](../enums/Devvit.Trigger.md#postupdate) } \| \{ `event`: `PostReport` ; `type`: [`PostReport`](../enums/Devvit.Trigger.md#postreport) } \| \{ `event`: `CommentSubmit` ; `type`: [`CommentSubmit`](../enums/Devvit.Trigger.md#commentsubmit) } \| \{ `event`: `CommentUpdate` ; `type`: [`CommentUpdate`](../enums/Devvit.Trigger.md#commentupdate) } \| \{ `event`: `CommentReport` ; `type`: [`CommentReport`](../enums/Devvit.Trigger.md#commentreport) } \| \{ `event`: `SubredditSubscribe` ; `type`: [`SubredditSubscribe`](../enums/Devvit.Trigger.md#subredditsubscribe) } \| \{ `event`: `AppInstall` ; `type`: [`AppInstall`](../enums/Devvit.Trigger.md#appinstall) } \| \{ `event`: `AppUpgrade` ; `type`: [`AppUpgrade`](../enums/Devvit.Trigger.md#appupgrade) }

---

### PostReportConfig

Ƭ **PostReportConfig**: `Object`

#### Type declaration

| Name      | Type                                                  |
| :-------- | :---------------------------------------------------- |
| `event`   | [`PostReport`](../enums/Devvit.Trigger.md#postreport) |
| `handler` | `Handler`\< `PostReport`\>                            |

---

### PostSubmitConfig

Ƭ **PostSubmitConfig**: `Object`

#### Type declaration

| Name      | Type                                                  |
| :-------- | :---------------------------------------------------- |
| `event`   | [`PostSubmit`](../enums/Devvit.Trigger.md#postsubmit) |
| `handler` | `Handler`\< `PostSubmit`\>                            |

---

### PostUpdateConfig

Ƭ **PostUpdateConfig**: `Object`

#### Type declaration

| Name      | Type                                                  |
| :-------- | :---------------------------------------------------- |
| `event`   | [`PostUpdate`](../enums/Devvit.Trigger.md#postupdate) |
| `handler` | `Handler`\< `PostUpdate`\>                            |

---

### SubredditSubscribeConfig

Ƭ **SubredditSubscribeConfig**: `Object`

#### Type declaration

| Name      | Type                                                                  |
| :-------- | :-------------------------------------------------------------------- |
| `event`   | [`SubredditSubscribe`](../enums/Devvit.Trigger.md#subredditsubscribe) |
| `handler` | `Handler`\< `SubredditSubscribe`\>                                    |

---

### TriggerConfig

Ƭ **TriggerConfig**: [`PostSubmitConfig`](Devvit.md#postsubmitconfig) \| [`PostUpdateConfig`](Devvit.md#postupdateconfig) \| [`PostReportConfig`](Devvit.md#postreportconfig) \| [`CommentSubmitConfig`](Devvit.md#commentsubmitconfig) \| [`CommentUpdateConfig`](Devvit.md#commentupdateconfig) \| [`CommentReportConfig`](Devvit.md#commentreportconfig) \| [`SubredditSubscribeConfig`](Devvit.md#subredditsubscribeconfig) \| [`AppInstallConfig`](Devvit.md#appinstallconfig) \| [`AppUpgradeConfig`](Devvit.md#appupgradeconfig)
