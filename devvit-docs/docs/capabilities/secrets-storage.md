# Secrets storage

Store sensitive data in your app.

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
    name: 'open-ai-api-key',
    // This label is used to provide more information in the CLI
    label: 'Open AI API key',
    // Type of the setting value
    type: 'string',
    // Marks a setting as sensitive info - all secrets are encrypted
    isSecret: true,
    // Defines the access scope
    // app-scope ensures only developers can create/replace secrets via CLI
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
open-ai-api-key  Open AI API key    true            STRING
```

Once you access the keys, you can assign values to the secret keys. This operation can only be performed by app developers, not mods or installers.

```bash
devvit settings set open-ai-api-key

? Enter the value you would like to assign to the variable open-ai-api-key : <value>

Updating app settings... ✅
Successfully added app settings for open-ai-api-key!
```

## Retrieving secrets

Once you’ve stored the secrets via CLI, your app can access the secrets during invocations using `context.settings.get(secretName)` method.

<details><summary>Code Example</summary>

```tsx
import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  http: true,
});

Devvit.addSettings([
  {
    name: 'open-ai-api-key',
    label: 'Open AI API key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
]);

async function fetchResponse(context: Devvit.Context): Promise<string> {
  try {
    const apiKey = await context.settings.get('open-ai-api-key');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
      }),
    });

    const json = await res.json();

    return json?.choices?.length > 0 ? json?.choices[0]?.message?.content : 'No response';
  } catch (e: any) {
    console.log('Fetch error ', e);
    return e.toString();
  }
}

Devvit.addCustomPostType({
  name: 'Devvit - Ask GPT',
  render: (context) => {
    const [answer, setAnswer] = useState<string>('');

    async function onPress() {
      const response = await fetchResponse(context);
      setAnswer(response || 'No Response');
    }

    return (
      <blocks height="tall">
        <vstack alignment="center middle" height="100%" gap="large">
          <button appearance="primary" onPress={onPress}>
            {'Ask GPT'}
          </button>
          <text wrap>{answer}</text>
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;
```

</details>

## Limitations

- At least one app installation is required before you can store secrets via the CLI. You can use Devvit [playtest](/docs/get-started/playtest.md) once with the latest `Devvit.addSettings` config to accomplish this.
- App setting values are currently not surfaced in the CLI.
