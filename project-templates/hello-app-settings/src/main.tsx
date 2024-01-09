import { Devvit, SettingScope } from '@devvit/public-api';

Devvit.configure({ media: true, redditAPI: true, http: true });

export enum Setting {
  OpenAIApiKey = 'open-ai-api-key',
  JokeSubject = 'joke-subject',
}

Devvit.addSettings([
  {
    type: 'string',
    name: Setting.OpenAIApiKey,
    label: 'My OpenAI API key',
    scope: SettingScope.App,
    isSecret: true,
  },
  {
    type: 'string',
    name: Setting.JokeSubject,
    defaultValue: 'programming',
    label: 'Subject of the jokes',
    onValidate: ({ value }) => {
      if (!value) {
        return 'You must enter a value for this field';
      }
    },
  },
]);

Devvit.addMenuItem({
  label: 'Devvit Jokes',
  location: 'subreddit',
  onPress: async (_, { reddit, ui }) => {
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      preview: (
        <blocks>
          <vstack padding="medium" cornerRadius="medium" alignment="middle center">
            <text style="heading" size="medium">
              Loading...
            </text>
          </vstack>
        </blocks>
      ),
      title: 'Devvit Jokes',
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Look for the Devvit Jokes post.`,
      appearance: 'success',
    });
  },
});

async function fetchResponse(context: Devvit.Context): Promise<string | void> {
  const apiKey = await context.settings.get(Setting.OpenAIApiKey);
  const settings = await context.settings.getAll();

  return fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ content: `Tell me a new joke ${settings[Setting.JokeSubject]}`, role: 'user' }],
      max_tokens: 50, // You can adjust this based on the desired length of the joke
      n: 1, // Number of completions
    }),
  })
    .then(async (res) => {
      const json = await res.json();
      return json?.choices?.length > 0 ? json?.choices[0]?.message?.content : 'No response';
    })
    .catch((e) => {
      console.log('Fetch error ', e);
      return e.toString();
    });
}

Devvit.addCustomPostType({
  name: 'Devvit Jokes',
  render: (context) => {
    const [answer, setAnswer] = context.useState<string | undefined>(undefined);

    async function onPress() {
      const response = await fetchResponse(context);
      setAnswer(response || 'No Response');
    }

    return (
      <blocks height="tall">
        <vstack>
          <button onPress={onPress}>{'Tell me a joke'}</button>
          <text>{answer}</text>
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;
