# @devvit/kit

Devvit Kit is a helper library that makes it easier to build Devvit apps. Kit includes both UI components and general backend patterns that simplify common tasks and enable developers to build apps faster.

You can find instructions on how to install and use @devvit/kit [here](https://github.com/reddit/devvit-kit).

## Available helpers

| Name                                                                                             | Description                                                                                  |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| [Columns](https://github.com/reddit/devvit-kit/blob/main/src/columns/readme.md)                  | Provides a simple column layout and optionally lets you specify gap sizing between elements. |
| [Pixel padding](https://github.com/reddit/devvit-kit/blob/main/src/pixel-padding/readme.md)      | A component that lets you set padding from any side using pixel values.                      |
| [Items pagination](https://github.com/reddit/devvit-kit/blob/main/src/item-pagination/readme.md) | Enables pagination of data, including a UI for navigating through the elements.              |
| [Dev toolbar](https://github.com/reddit/devvit-kit/blob/main/src/dev-toolbar/readme.md)          | Adds a toolbar of actions only visible to developers.                                        |

## Example

Once @devvit/kit is installed, you can use the components in your app. This example uses the `Columns` component.

```tsx
import { Devvit } from '@devvit/public-api';
import { Columns } from '@devvit/kit';

Devvit.addCustomPostType({
  name: 'Columns static content',
  render: () => {
    return (
      <vstack padding="medium">
        <Columns columnCount={2} gapX="5px" gapY="10px" order="column">
          <hstack backgroundColor="grey">
            <text>Birds</text>
          </hstack>
          <hstack>
            <text>Raven</text>
          </hstack>
          <hstack>
            <text>Parrot</text>
          </hstack>

          <hstack backgroundColor="grey">
            <text>Dogs</text>
          </hstack>
          <hstack>
            <text>Bulldog</text>
          </hstack>
          <hstack>
            <text>Poodle</text>
          </hstack>
        </Columns>
      </vstack>
    );
  },
});
```

You can also [try out this example](https://developers.reddit.com/play#pen/N4IgdghgtgpiBcIQBoQGcBOBjBICWUADgPYYAuABMACIwBudeZAvhQGYbFQUDkAAgBN6jMgHpCAVwBGAGzxYAtBEJ4eAHTAaNtBkwB0EAQIDCEtGS4AFYuYAqAT0IwAFMA0UKkWPF7HiMiSgwNApzCDJ5CixiMDIYWJ5kdwoMeKEMH2cASgoAXgA+KmSPVLIJDDAKZ2KPCgAeOjCsAGsKQkMBPDAAc1y1EFhOwP78mtr6vwCgkOipsD8JWNzgACZWbuUADT6QAFZCAA9+ig3CAE0dgEYABkPj0nSd2cDNEFHK8c+xz7qACybWlIIC1upxFiZ-KQdqCYPYRt9PvU4gcyPkAEJ4DACNB1UTI1EI2q4-5kYHNd6I8Z-AEUylU-H5ABKEDo8VxDMJHmJNM59RJZNpdK5DMsEAwnDI7JgKMFlO5pJa7151IVgLJoOI4MmUP6MLhb15wulqOoxG6OLxxtliPlAuV-MVhqRVrREhkMgEZqlMuVogd5PtPI+QudMusxAEMhg3oJwblfqDIcJuMmLzQ1vqokaqtlWQA3BpmFktJpSyXy2XKyW2IssBEYicYGQAMqEORkCI9ABitfrYGcDxgGQojLSQ663QA8lih1kfK3253uj2wHW8A23B88GwqoOMHlcrleM8gjwcpvxqVypU0G2mABJOJQNAFj7MZLb3cz-eHo88E9gAobB4O6Z5FHGV4VKEd5kI+MDPqmQRdiBMivh475bjuA7fgeR79JwADu-TnjUkE3jBcHPoyxAEWhFAYR4oiiCkY77jEMBRP4LwUBAIQQBQQhsBAbqUFIMC-Cy67lMkZFVEw8FoDkBQUAA2ipegafJz4ALraa+GEaNKJDkJxwSUIhwR5FUhCcIQaA+DoIh6GiMjEC0fhEOxsSWLZOIWWgPnEHZ+RzhQABSzabHoACiUawLEeSFBeFCfs4ACENlBWgehYL8IECKklQAD5FRQaUAILihA9h6HgaCVRg1XOJldk5XlHqFVkJEQU2171PkwAtdluX5YVzC4vkdEMaZ5gUHuVlDXo80lceXGnnR0RmZxcwLAlR6LQBu2UIU1wUAA-G0vk5Wt8yaglPiXBtMSzVAEAHNRBEhPtV2ve9NEhAAZADl1ZXov0fSEJ3nSDrXg-9FA+PeYDAWATD2E9W2nJshwLVdWPQwAcoEYkYM1eNbHot7ts4PCHGeKnXNpOQ+NcGOzVj854AAXjAlh4AcMAyF9JxbDjQMi4Q2MHBQUMXQABgAJMAWOHMwhxywjvC3AcPBs5QpxnDj32gwbhPE0OZMm8oZyUzBNN01kDNM5rrPJJt7PW5zPN8wLQtWQbYvAwH0uyxQivK9bqvq5rPDa7rbvPZQVNMEuK5rg2R7dE2C4pxOad9th6T5gnW0AcLycdnnvbrv2B3tQV8TINtLxHU3cOfcXHzu-4MB6K53TOGXnclL1UHVHGKpkhQBF4AIZC-MsNzXMwGbAGXYPKM4g83U3AFI0IBxKUlhKyePIZ1BmiJrzd+-SjLFCneLk8tNPs-z8sWMr7airTef2ZTzPOeC9gBLwoMxQ6d0WAnEIpfSk185gb0IFvLSTdCK30PolcCIZESnydDaWB2CqBoLAAfe+j9gbP1aL8GAeBui-DIB-a2X8Ew5l-oQz4wAtJsPYZmAhlJh7sKLNw+M-9HRxhtKIWBAjxhCJqN-AMHxO7MFfIZA4xlKA1lXH2aC7ZKI4lsPkZwXRJBkB8LYFS2ld43Xsp4c2GA25vQhj4MAdjQrmO0hYrBM1KC-T0dQOqbZqowAEFZAAsuEX4YMuhn1qO3L6h4KBIxRmjaGxiJBkD7vEbo89NZlwoAAKgoHEpIcY0kZKjD0eeyQBHu0oFpNAthiD+PMBgPAUh0kcSPGUymcgsAuGuA4g4fiAkyCCQIGpicTgSDFBAWIMBgl6KRhZMJES9BsFcqQIxT4GlNLqmQVp7S4iZMqb8MBzdpgCKjJQToLS2kdIhIsSgR5XZd0makNAIkzEWM8UeBqTUh41DWShZwLj3TFjjIgreR9VJMzomwUgVQrkpSsqzZFdRznBDzClAA1Ni7q4xamhFJOQdBVkbn7LuXEB5sQ6IeEJfUgAMjANgZAjpWXqY05pFLDm9wqdk05CgBJ7IOfco6tLvEYrQEyllVk8mCrwOK+l2zGnlSMHkb4jLmWssgRQAApJK6VlALrdGmY1OZCztlLJuhQbFFBLiaxNTM81AhFm3TmOK95IkVJ4G0uy5Vuzbk8p6fIFwYQSUkOlE3MNsEI3S1tRy4gqrxnivJSKqlbLsVdP9UmqaMlR6VE9TIMg+kSxGVIBo6uDYK56Isshd0dQDFGLACYr5ljJXOLsYMpxtioAkzcd831yVCW+O2c0wJ9hgkrPnlE-sNQ4m4UScjLoKSLrdL5TknweTCnFJqGurJVTFF6xYh8otrafkUD+fYbecxFKAuAu6EFboZDgvGJC7ImCLGXKbFEcohVtVzBRXRJFWBf3xDIB9QDyR4X7mcEivAgG0VFLesMqmYysV4Fxfi2oqUQPijAxB-IR44lYYJaB2IEHnnirpWR-93FM12vFWwwtZAVK4b-RZbSehJBoF+E2kx3rYU1DY-hmiNqjyPWSNNWSzGS2ljLSZTR6dyK6O2R9BthiymtqsTejtvahxdv+rpvtZ7B0lxesh0dIyxlTsiVAaJc7HHw1-Iu5JZB7CpObek45-LcnWIKUhv6n0SnjD3Sc6pR7mMmaspe69aYX21CBQ+0Fz7AWvSQe+5Sn6gPfuE7EZZlGoMItg9++DlHEMjoUmO0ZE6BDocw14jwOGaPLMI5KkjtRcu0aCJBuMTGYAnpY51jjXGzC8bKQJ6RP68N5etfRiTb481lCgjJwsFZ5OUDc04CgzZua835oLYW4cXF6YwGrA4csVFgHWxQTbHFRwRtaT0ac6QrL9AAscUqb2bpARQh9ig+EaL9Eu9d27FB-KBTslZIdN0jpGaHHROJZ04cYDonuJHI5WITme-D5IWN0c7e9vtoWdEDb492z7A7+lgdqPLTdxwHEc6V27JWyoR51N8fSVp9tPaSYGc+sj6F7iLFrZpyZQSwki0UEckwFAIBWQYDQDXBAlxmBAA) in the playground.

For more detailed instructions, visit [@devvit/kit](https://github.com/reddit/devvit-kit).
