[**@devvit/public-api v0.12.7-dev**](../README.md)

---

# Function: fetchDevvitWeb()

> **fetchDevvitWeb**(`ctx`, `endpoint`, `init`?): `Promise`\<`Response`\>

Makes a fetch request to the devvit web backend server from your block app
This is a migration tool to help you migrate your block app to the new Devvit Web architecture.

## Parameters

### ctx

[`BaseContext`](../type-aliases/BaseContext.md)

the devvit context

### endpoint

`string`

the endpoint to make the request to

### init?

`RequestInit`

the request init options

## Returns

`Promise`\<`Response`\>

a promise that resolves to the fetch response
