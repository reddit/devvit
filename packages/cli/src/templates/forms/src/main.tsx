import { Devvit } from '@devvit/public-api';

// Context.reddit.* interactions require the redditAPI configuration.
Devvit.configure({ redditAPI: true });

Devvit.addMenuItem({
  label: 'New Planet Post',
  location: 'subreddit', // Show in the subreddit overflow menu.
  onPress: async (_, ctx) => {
    ctx.ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await ctx.reddit.getCurrentSubreddit();
    const post = await ctx.reddit.submitPost({
      preview: PlanetPostPreview(),
      title: 'What planet are you from?',
      subredditName: subreddit.name,
    });
    ctx.ui.navigateTo(post);
  },
});

function PlanetPostPreview(): JSX.Element {
  return (
    <vstack padding="medium" cornerRadius="medium">
      <text style="heading" size="medium">
        Loading planets, stars, space…
      </text>
    </vstack>
  );
}

Devvit.addCustomPostType({
  name: 'PlanetaryPost',
  render: (ctx) => {
    // Each Reddit API call issues an HTTP request which is slow. Only make a
    // request once on the first render and cache the result across re-renders.
    const [username] = ctx.useState(async () => {
      const user = await ctx.reddit.getCurrentUser();
      return user!.username;
    });

    // Cache the user response, initially empty.
    const [planet, setPlanet] = ctx.useState('');

    // Make a quick prompt form that updates the user response with setPlanet().
    const prompt = ctx.useForm(
      {
        fields: [
          {
            name: 'planet', // "planet" is the response field key.
            label: 'I am from…',
            type: 'string',
            required: true,
          },
        ],
      },
      async (rsp) => {
        ctx.ui.showToast({ text: 'Planet recorded!', appearance: 'success' });
        setPlanet(rsp.planet); // "planet" is the response field key.
      }
    );

    return (
      <vstack gap="medium">
        {planet ? (
          <text size="xlarge">{planet}</text>
        ) : (
          <button onPress={() => ctx.ui.showForm(prompt)}>{username} is from…</button>
        )}
      </vstack>
    );
  },
});

export default Devvit;
