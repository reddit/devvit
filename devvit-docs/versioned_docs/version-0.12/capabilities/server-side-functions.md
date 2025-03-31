# Server-side functions

Devvit apps that create interactive posts generally run on the client side, which exposes code to users and clients for performance purposes. However, there are scenarios where you might want to keep certain parts of your codebase private—such as proprietary algorithms, sensitive data handling, or secure operations. Server-side functions allow you to store server-side code that remains hidden from clients.

## How it works

To add server-side code to your app, structure your project in one of the following ways:

Create a server folder for server-side code in your project directory: `<project-directory>/server/yourCode.ts`

Add .server. to your filename to indicate that it contains server-side code: `<project-directory>/yourModule.server.ts`

Any functions or modules imported from these server-side files will be executed on the server and keep implementation details hidden from the client.

Example:

Project Structure:

- project-directory/
  - index.tsx
  - server/
    - randomNumber.ts

Client-side Code (index.tsx):

```tsx
import { Devvit, useState } from '@devvit/public-api';
import { getRandomNumber } from './server/randomNumber.js;

Devvit.configure({
  http: true,
});

Devvit.addCustomPostType({
  name: 'Random Number Generator',
  render: () => {
    const [number, setNumber] = useState<number | null>(null);

    async function fetchRandomNumber() {
      const result = await getRandomNumber();
      setNumber(result);
    }

    return (
      <blocks>
        <vstack alignment="center middle" gap="medium">
          <button appearance="primary" onPress={fetchRandomNumber}>
            Generate Random Number
          </button>
          {number !== null && <text>Your number: {number}</text>}
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;
```

Server-side Code (server/randomNumber.ts):

```tsx
export async function getRandomNumber(): Promise<number> {
  return Math.floor(Math.random() * 100) + 1;
}
```

## Limitations

Server-side functions may add performance overhead by introducing network latency. You’ll want to minimize unnecessary server interactions to keep your app responsive. For high-traffic apps, avoid making server calls during the first render unless necessary and leverage useAsync to perform server side calls without blocking the render process.
