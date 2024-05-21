# Secrets storage

Store sensitive data in your app.

:::note
This feature is experimental, which means the design not final but it's still available for you to use.
:::

There are times when you’ll want to store information in your app that should not be visible to users. Secrets are variables that contain sensitive information like API keys, credentials and tokens. Devvit lets you store and access secrets in three steps:

1. Define secrets in the app.
2. Provide secrets via Devvit CLI.
3. Retrieve secrets in the app.

## Defining secrets

You can use the existing `Devvit.addSettings` DX to define secrets.

```tsx
import { Devvit } from '@devvit/public-api';

Devvit.addSettings([
  {
    // Name of the setting which is used to retrieve the setting value
    name: 'weather-api-key',
    // This label is used to provide more information in the CLI
    label: 'My weather API key',
    // Type of the setting value
    type: 'string',
    // Marks a setting as sensitive info - all secrets are encrypted
    isSecret: true,
    // Defines the access scope
    // app-scope ensures only app developers can create/replace secrets via CLI
    scope: 'app',
  },
]);
```

## Providing secrets

You will be able to list app-scoped keys via the CLI. Use the `devvit settings` command in a Devvit project.

```bash
devvit settings list

Key               Label            Is this a secret?   Type
───────────────  ──────────────    ─────────────────   ──────
weather-api-key  My weather API key    true            STRING
```

Once you access the keys, you can assign values to the secret keys. This operation can only be performed by app developers, not mods or installers.

```bash
devvit settings set weather-api-key

🤠 Howdy <username>! settings will be added at the app-scope and will be globally accessible across all subreddit installs. That means more power to you, please use it wisely.

? Enter the value you would like to assign to the variable weather-api-key: <value>

Updating app settings... ✅
Successfully added app settings for weather-api-key!
```

## Retrieving secrets

Once you’ve stored the secrets via CLI, your app can access the secrets during invocations.

```tsx
Devvit.configure({
  http: true,
});

Devvit.addCustomPostType({
  name: 'Hello Blocks',
  render: (context) => {
    const fetchWeatherInfo = async () => {
      const apiKey: string | undefined = await context.settings.get('weather-api-key');
      if (apiKey) {
        const request = new Request(`https://weather.com`, {
          headers: { Authorization: apiKey },
        });
        const response = await fetch(request);
        console.log('response ', response);
      }
    };
    // Your custom post layout goes here!
    return (
      <vstack padding="medium" cornerRadius="medium" gap="medium" alignment="middle">
        <button appearance="primary" onPress={() => fetchWeatherInfo()}>
          Click me!
        </button>
      </vstack>
    );
  },
});

export default Devvit;
```

## Limitations

- At least one app installation is required before you can store secrets via the CLI. You can use Devvit [playtest](/docs/get-started/playtest.md) once with the latest `Devvit.addSettings` config to accomplish this.
- App setting values are currently not surfaced in the CLI.
