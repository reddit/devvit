[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Function: svg()

> **svg**(`strings`, ...`args`): `""` \| `` `data:image/svg+xml;charset=UTF-8,${string}` ``

**`Experimental`**

A helper to allow SVG functionality within image tags.

## Parameters

### strings

`TemplateStringsArray`

### args

...(`string` \| `number`)[]

## Returns

`""` \| `` `data:image/svg+xml;charset=UTF-8,${string}` ``

## Example

```ts
import { Devvit, svg } from '@devvit/public-api';
const App = () => {
    const color = 'gold'
    return (
       <hstack>
         <image
           url={svg`<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                     <circle fill="${color}" cx="5" cy="5" r="4" />
                   </svg>`}
           imageHeight={100}
           imageWidth={100}
         />
       </hstack>
    )
}
```
