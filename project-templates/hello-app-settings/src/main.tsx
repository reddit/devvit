import { Devvit, SettingScope } from '@devvit/public-api';

Devvit.configure({
  http: true,
});

Devvit.addSettings([
  {
    // This is the name of the setting which can be used to retrieve the value of the setting
    name: 'weather-api-key',
    // This label is used to provide more information in the CLI or in dev portal
    label: 'My weather api key',
    placeholder: 'Add your weather api key here',
    type: 'string',
    scope: SettingScope.App,
    isSecret: true,
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

export default Devvit;
