# Items pagination
A data helper that makes it easier to split large sets of data into smaller chunks (pages).

## How to use

### Step 1: Install the Devvit kit
Open your project folder in the terminal app.

Run `npm intall @devvit/kit`

### Step 2: Import the `usePagination` function
Add the line `import { usePagination } from '@devvit/kit';` in the beginning of the component file.

### Step 3: Use pagination in your app
If you have a long list of items but a limited space to display them, `usePagination` comes to play!

`usePagination` function expects following params
 - `context` - Devvit.Context
 - `items` - Array of any kind of serializable data
 - `itemsPerPage` - number of items per page

The returned object has the following data:
 - `currentItems`: `Array<ItemType>` - a slice of input items limited by `itemsPerPage`
 - `currentPage`: `number` - index of the current page (starts with 0)
 - `pagesCount`: `number` - number of pages available
 - `isFirstPage`: `boolean` - true if it's the first page of the data
 - `isLastPage`: `boolean` - true if it's the first page of the data
 - `toPrevPage`: `undefined | (() => void)` - a function that changes the slice to the previous page if possible, otherwise `undefined`
 - `toNextPage`: `undefined | (() => void)` - a function that changes the slice to the next page if possible, otherwise `undefined`

In your component you can add usePagination like this:

[Interactive Example](https://developers.reddit.com/play#pen/N4IgdghgtgpiBcIQBoQGcBOBjBICWUADgPYYAuABMACIwBudeZAvhQGYbFQUDkAAgBN6jMgHpCAVwBGAGzxYAtBEJ4eAHTAbaDJgDoIAgQGEJaMlwAKxMwBUAnoRgAKYBooVIseLwBy0GDzIbhQYMGBCGN5OWMRgZDAAHmQAlBQAvAB8VMExYGYUUHbUEGQQ6RQA2gCMyBQATLUAzLUALLUArLUAbLUA7LUAHLUAnLVVAAwAugDcObH5wFgSGKFxFhAA5jC1SythZACS8VBoteY+iWTrW2fEFqF01zCsaRSmMNd4kGR4sdGx8SStUKxVKrWSszA7ncwVCZGWUIAPHQzBAsABrCiEAwCL4bNJqEAyCAYLaEjLBGFQ6HAUQAKgoACUwhE8RQmDATuxSBQyAALGAUXarSjYrYUOmiZiUijI1EYigbZQE9BQCAyGSErE4vEqtBqjVaqBfAASMDwGz5ZBVVXa40ICXJMvci2WIqOnLQujVhCcHO4mQoTkRHqgRi4JDA+3ZxzSwH9zFEGWSyWl1PciNEKNKGIp6YoMtpDOZ4RgGDZYq+JV+UNyZE4MjQEqlMsRfPlmPVFrAsDiKuNhhkgqw+zLWqVhD1Bs1IDz0OhiKkEjI5ihsXuMDQaDj5g3j02z3ZuRVQ7YZEJSedssBZAyrr2awPzEzN7n89lS5XsQo69CW53xAXEkTysPIsQquWlrniAl75pm7Y5uiebBJm2ZokhwRpswyQaLhmhgLk+ShuGRCxNGrxOIQnCEGg8Dxsc3gQGAdjYd4ABSADKAAaugAKJDr2lCZK41JwgisoIehFBSOhGycBI4ThjIpAqlgdhMVqXYbD2+yqaOGDkoir7AJxADyPi6GY5ZgBseBsHYlHUV6-qpi+lwZPBHYZJCaZ4RoiQkOQvIOIKACqaAfJsVY-LEzLwhgYAhsc9iOFkrwie4YqbuGClkN4YASFAUhlpC7jCvsoa0RQACCKwQHYSWcilMDeTkbr7E8+WFcVGCleyaAAGJ4BgZiddJxDEEOTF9XgaAADIQKNB7eFIE1TWAfW7g8Y0KUIbBfDAAgUAAPkGTipIGdDEHgAgQsE5yXDtpb7VGR2nU453pFkV03XdYDMJC-kJIFlBsApWAxVC7yfN8NaNVAzUZE4cxxJc3gWPI6KItoIi6OGqNArw7wcaU8Q8BkQTUv6VWhs1FSTJT7jUxYZZjQVRVjmAyTeOFkW2bDsUwPFiW0yFWQZUK8yUBU5WPjcFARWQJgPlcB6TOUdaXLoxOk844x-cEdlBrLqvioiFD69k+b8pwADuHgwPbvErKQTg8ANEB4EOR3mNq-MlIKbA8ll3gKFUPB-e4vnUoRlC4owaA1syaASDIQkxp6uhDjZ-IUKIGcnCzGBPH1sd+9lxC5eUACyJR8roI5e048ezUnm6pykgMx1L-VDSNpuCq8JtPOkaSvOMpc97NC1LeKQ-tXLg9j+XaA5XEFAKBQVR9WJCVW-Ow8Hoz0JZavldxMfZUL4cxxVdTllyCOyP5lfKsjwyzOs0fV6H+KH+30XEeABqAuaBAEHhlMkS+vdhqz22DKaei0B7QK2vQMas0+5wKvAAfjeM9A6AgrxRAuuLK885FbKxFE8aI18R6byqJHd8UcUGAUestfqM8B44LwXtAhRCgwkP3kw6EFDaEHhoW-A8FAQEML6kw5gx8AYaGjgFUgccYBsAgB3CgOMmAoBAHQMsidYgICqMwIAA)
```typescript jsx
// assuming you already have the data stored in `myData`
// and you want to show 4 items per page
const {currentPage, currentItems, toNextPage, toPrevPage} = usePagination(context, myData, 4);

return <vstack padding="large">

  {/* Rendering items for the current page */}
  <vstack gap="small" padding="small" minHeight="150px">
    {currentItems.map(item => (<ItemComponent item={item}/>))}
  </vstack>

  {/* Rendering pagination controls */}
  <hstack alignment="middle center" gap="small">
    <button onPress={toPrevPage} icon="left"/>
    <text>{currentPage}</text>
    <button onPress={toNextPage} icon="right"/>
  </hstack>

</vstack>
```
