[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: FormFunction()\<T\>

> **FormFunction**\<`T`\> = (`data`) => [`Form`](Form.md)

A function that returns a form. You can use this to dynamically generate a form.

## Type Parameters

### T

`T` _extends_ `object` = \{\}

## Parameters

### data

`T`

## Returns

[`Form`](Form.md)

## Example

```ts
const formKey = Devvit.createForm((data) => ({
  fields: data.fields,
  title: data.title,
}), callback);

...

ui.showForm(formKey, {
 fields: [{ type: 'string', name: 'title', label: 'Title' }]
 title: 'My dynamic form'
});
```
