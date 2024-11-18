# Setting post size

Specify the height and element sizes.

There are two sets of dimensions that you’ll need to think about when creating an interactive post: the height of the post itself and the dimensions of the elements within the post. These dimensions will let you create responsive designs that will render consistently across platforms.

## Post height

Height is a property on `addCustomPostType`. You can set the height to `regular` or `tall`. By default, posts are regular height.

### [Playground link](https://developers.reddit.com/play#pen/N4IgdghgtgpiBcIQBoQGcBOBjBICWUADgPYYAuABMACIwBudeZAvhQGYbFQUDkAAgBN6jMgHpCAVwBGAGzxYAtBEJ4eAHTAbaDJgDoIAgQGEJaMlwAKxMwBUAnoRgAKYBooVIseLwBy0GDzIbhQAFjB4AOYhZN48ZBAyMoHBGDBgQhjeAPpYxGBkMAAelAC8AHxUwe6pZBIYYBROVe4UADyyxFgA1mhlze6toh3dvc0AlMHMGswTmmBFJOQUQmwQEjKU2iIoIHQwGGh4eQgAjMxAA)

### Code sample

```tsx
import { Devvit } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Name',
  height: 'tall',
  render: (_context) => {
    return <blocks></blocks>;
  },
});

export default Devvit;
```

## Elements height and width

Elements in blocks have a height, width, and a corresponding minimum and maximum size for each. Elements are defined using pixels or percentages.

### [Playground Link](https://developers.reddit.com/play#pen/N4IgdghgtgpiBcIQBoQGcBOBjBICWUADgPYYAuABMACIwBudeZAvhQGYbFQUDkAAgBN6jMgHpCAVwBGAGzxYAtBEJ4eAHTAbaDJgDoIAgQGEJaMlwAKxMwBUAnoRgAKYBooVIseLwBy0GDzIbhQYMGBCGN4A+ljEYGQwAB6UALwAfFTB7qFkEhhgFE5Z7hQAPHRmEFgA1mnF7mpkpQAWlTUUAO54AmTNKTwATACshIk8FM0weADmzWT9w6PjUlXV05wS4UbEMqT9shIBaaWirWSrdQUlDU1nq53dvQsjYxNTs-ODL8ur68Sbxh2ex46xgYR4x1ObVqFGKjRa0IePT6XyWbxmc2eaJWNT+AO2uww-VCAghJzuNUu13cJwq50pxQAlMFmBpmMzNGAkiRyBQhGwIBIZJRtCIUCA6DAMGg8HEEABGZhAA)

### Code sample in pixels

```tsx
import { Devvit } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Name',
  render: (_context) => {
    return (
      <vstack>
        <hstack width="25px" height="25px" backgroundColor="blue"></hstack>
        <hstack width="25px" height="25px" backgroundColor="green"></hstack>
        <hstack width="25px" height="25px" backgroundColor="red"></hstack>
      </vstack>
    );
  },
});

export default Devvit;
```

## Min/max height and width

You can also specify the minimum and maximum height and width in your interactive post to get the desired layout across platforms. Use `minWidth`, `maxWidth`, `minHeight`, and `maxHeight` to set these parameters.

### [Playground link](https://developers.reddit.com/play#pen/N4IgdghgtgpiBcIQBoQGcBOBjBICWUADgPYYAuABMACIwBudeZAvhQGYbFQUDkAAgBN6jMgHpCAVwBGAGzxYAtBEJ4eAHTAbaDJgDoIAgQGEJaMlwAKxMwBUAnoRgAKYBooVIseLwBy0GDzIbhQYMGBCGN4A+ljEYGQwAB6UALwAfFTB7qFkEhhgFE5Z7hQAPHRmEFgA1hQA7ngCZAAWKTwAjAAMnYSJPBRQEIkAEjB4AObNZG1dPX0UUlXV45wS4UbEMqRtdjAyW3U8acUlJaXNlTVppQnJFGh4AF4wKWogiYkyEBjjMG9pAGUuDAKAAZb6-Cg2JKUUahUqiW5ka6iC5kJbHAqnMqiCroq7FACUwWYGmYxM0YCSJHIFCEbAgEhklG0Ig0KBAdBgGAecQQ7WYQA)

### Code sample with maxHeight

```tsx
import { Devvit } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Name',
  render: (_context) => {
    return (
      <vstack width="100px" maxHeight="100px" backgroundColor="yellow">
        <hstack>
          <text size="xxlarge">Some Large Text Here</text>
        </hstack>
      </vstack>
    );
  },
});

export default Devvit;
```
