import { Devvit, SettingScope } from '@devvit/public-api';

Devvit.configure({
  http: true,
});

const CITIES = new Set(['Rome', 'Tokyo']);

function isValidCity(cityName: string | undefined): boolean {
  return !!cityName && CITIES.has(cityName);
}

Devvit.addSettings([
  {
    type: 'string',
    name: 'weather-api-key',
    label: 'My weather.com API key',
    scope: SettingScope.App,
    isSecret: true,
  },
  {
    type: 'string',
    name: 'Default City',
    defaultValue: 'Rome',
    label: 'Default city to show the weather for by default',
    scope: SettingScope.Installation,
    onValidate: ({ value }) => {
      if (isValidCity(value)) {
        return 'You must ender a valid city: ${validCities.join(", ")}';
      }
    },
  },
  {
    type: 'number',
    name: 'Default Forecast Window (in days)',
    defaultValue: 3,
    label: 'The number of days to show for forecast for by default',
    scope: SettingScope.Installation,
    onValidate: ({ value }) => {
      if (!value || value < 10 || value < 1) {
        return 'Forecast window must be from 1 to 10 days';
      }
    },
  },
]);

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

Devvit.addMenuItem({
  label: 'New weather app',
  location: 'subreddit',
  /*
   * _ tells Typescript we don't care about the first argument
   * The second argument is a Context object--here we use object destructuring to
   * pull just the parts we need. The code below is equivalient
   * to using context.reddit and context.ui
   */
  onPress: async (_, { reddit, ui }) => {
    const subreddit = await reddit.getCurrentSubreddit();

    /*
     * Submits the custom post to the specified subreddit
     */
    await reddit.submitPost({
      // This will show while your custom post is loading
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading weather app...
          </text>
        </vstack>
      ),
      title: `${subreddit.name} Weather App`,
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Successfully created a weather app!`,
      appearance: 'success',
    });
  },
});

export default Devvit;
