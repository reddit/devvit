import { BaseContext, ContextAPIClients, Devvit, Form, MediaPlugin } from '@devvit/public-api';
import {
  createDatetime,
  getHourOptions,
  getFormattedTimeLeft,
  getTimezones,
  formatDateTime,
} from './utils.js';
import { parse } from 'tldts';

Devvit.configure({
  redditAPI: true,
  kvStore: true,
  media: true,
});

Devvit.debug.emitSnapshots = true;

const APPROVED_DOMAINS = ['redd.it', 'redditstatic.com', 'redditmedia.com'];

const POST_DATA_KEY = (postId: string): string => `countdown_${postId}`;

type DropdownOption = { label: string; value: string };

const mapValueToDropdownOption = (inputValue: string) => {
  return { value: inputValue, label: inputValue };
};

async function getRedditImageUrl(imageUrl: string, media: MediaPlugin): Promise<string> {
  const domain = parse(imageUrl).domain;
  if (APPROVED_DOMAINS.includes(domain || '')) {
    return imageUrl;
  }

  const extension = imageUrl.split('.').pop() || 'jpg';
  const { mediaUrl } = await media.upload({ url: imageUrl, type: extension });
  return mediaUrl;
}

const TIME_VALUES: DropdownOption[] = getHourOptions(2).map(mapValueToDropdownOption);
const TIMEZONE_VALUES: DropdownOption[] = getTimezones().map(({ name, tzValue }) => ({
  value: tzValue,
  label: name,
}));

type CountdownFormData = {
  title: string;
  description?: string;
  date: string; // dd-mm-yyyy
  time: [string]; // hh:mm 24h format
  timezone: [string]; // Intl timezoneName
  link_url?: string;
  link_title?: string;
  img_url?: string;
};

type CountdownData = {
  title: string;
  description?: string;
  dateTime: string; // ISO-8601
  link_url?: string;
  link_title?: string;
  img_url: string | null;
};

const CountdownForm = Devvit.createForm(
  {
    title: 'Create a countdown timer',
    fields: [
      { name: 'title', label: 'Post Title', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string' },
      {
        type: 'group',
        label: 'End date and time',
        fields: [
          { name: 'date', label: 'Countdown date (dd-mm-yyyy)', type: 'string', required: true },
          {
            name: 'time',
            label: 'Countdown time',
            type: 'select',
            required: true,
            defaultValue: ['12:00'],
            options: TIME_VALUES,
          },
          {
            name: 'timezone',
            label: 'Timezone (default value is your current timezone: ',
            type: 'select',
            required: true,
            defaultValue: ['-04:00'],
            options: TIMEZONE_VALUES,
          },
        ],
      },
      {
        type: 'group',
        label: 'Add a link (optional)',
        fields: [
          { name: 'link_title', label: 'Link label', type: 'string' },
          { name: 'link_url', label: 'Destination URL', type: 'string' },
        ],
      },
      {
        type: 'group',
        label: 'Add an image (optional)',
        fields: [
          {
            name: 'img_url',
            label: 'Image URL',
            type: 'string',
            helpText: 'We recommend using an image with a transparent or solid color background',
          },
        ],
      },
    ],
    acceptLabel: 'Next',
  },
  async (event, { reddit, kvStore, ui, subredditId, media }) => {
    const formData = event.values as CountdownFormData;
    if (formData.img_url) {
      // check valid domain
      const domain = parse(formData.img_url).domain;
      if (!domain) {
        ui.showToast('Invalid image url provided');
        return;
      }
    }

    const postData: CountdownData = {
      title: formData.title || '',
      description: formData.description || '',
      dateTime: createDatetime(formData.date, formData.time[0], formData.timezone[0]),
      link_url: formData.link_url || '',
      link_title: formData.link_title || '',
      img_url: formData.img_url ? await getRedditImageUrl(formData.img_url, media) : null,
    };

    const subredditName = (await reddit.getSubredditById(subredditId))?.name;
    if (!subredditName) {
      ui.showToast('Something went wrong, try again tomorrow');
      return;
    }

    await kvStore.put(POST_DATA_KEY('test'), postData);
    try {
      const post = await reddit.submitPost({
        title: `[Countdown] ${postData.title}`,
        subredditName,
        preview: (
          <blocks height="regular">
            <vstack>
              <text>Something is coming...</text>
            </vstack>
          </blocks>
        ),
      });

      await kvStore.put(POST_DATA_KEY(post.id), postData);

      ui.showToast(`Countdown created!`);
    } catch (e) {
      ui.showToast('Ooof, bad day, huh?');
    }
  }
);

const ErrorState: Devvit.BlockComponent = () => {
  return (
    <blocks height="regular">
      <vstack>
        <text style="heading" size="xxlarge">
          Loading...
        </text>
        <text style="heading" size="medium">
          Try again later
        </text>
      </vstack>
    </blocks>
  );
};

async function getPostAssociatedData(context: ContextAPIClients & BaseContext) {
  const postId = context.postId || 'test';
  if (!postId) {
    return null;
  }
  const postAssociatedData: CountdownData | undefined = await context.kvStore.get(
    POST_DATA_KEY(postId)
  );
  if (!postAssociatedData) {
    return null;
  }

  return postAssociatedData;
}

const makeLinkForm = (postData: CountdownData): Form => {
  return {
    title: 'Copy the link to see it yourself!',
    description: postData.link_url ? decodeURI(postData.link_url) : 'Just believe me',
    fields: [],
    acceptLabel: 'Cool!',
  };
};

Devvit.addCustomPostType({
  name: 'Community Countdown',
  description: 'Mark the date!',
  render: (context) => {
    const [postAssociatedData, _] = context.useState(async () => {
      return await getPostAssociatedData(context);
    });

    if (!postAssociatedData) {
      return <ErrorState />;
    }

    const [timeLeft, setTimeLeft] = context.useState(() => {
      const now = Date.now();
      const target = new Date(postAssociatedData.dateTime).getTime();
      return Math.max(target - now, 0);
    });

    const interval = context.useInterval(() => {
      setTimeLeft(timeLeft - 1000);
    }, 1000);

    if (timeLeft > 0) {
      interval.start();
    } else {
      interval.stop();
    }

    const linkForm = context.useForm(makeLinkForm(postAssociatedData), () => {});

    const formattedDueDate = formatDateTime(postAssociatedData.dateTime);
    const formattedTimeLeft = getFormattedTimeLeft(timeLeft);
    const hasLink = postAssociatedData.link_url;
    const contentEventHappened = hasLink ? (
      <button
        width={50}
        onPress={() => {
          context.ui.showForm(linkForm);
        }}
      >
        {postAssociatedData.link_title || 'Click here!'}
      </button>
    ) : (
      <text style="heading" size="xxlarge">
        It happened!
      </text>
    );

    return (
      <blocks height="regular">
        <vstack alignment="center" height={100} grow={true}>
          <spacer grow={true}></spacer>
          <text style="heading" size="xxlarge" alignment="center">
            {postAssociatedData.description}
          </text>
          <spacer size="small"></spacer>
          <text
            style="heading"
            size="small"
            weight="regular"
            alignment="center"
            color="neutral-content"
          >
            {formattedDueDate}
          </text>
          {!postAssociatedData.img_url ? undefined : (
            <hstack alignment="center" padding="medium">
              <vstack cornerRadius="large">
                <image
                  url={postAssociatedData.img_url}
                  imageWidth={150}
                  imageHeight={150}
                  resizeMode="cover"
                ></image>
              </vstack>
            </hstack>
          )}
          <hstack gap="medium" alignment="center">
            {!formattedTimeLeft
              ? contentEventHappened
              : formattedTimeLeft.map((remainingTimeEntry) => (
                  <vstack>
                    <text size="large" weight="bold" alignment="center">
                      {remainingTimeEntry.value || '0'}
                    </text>
                    <text size="small" weight="regular" alignment="center">
                      {remainingTimeEntry.label}
                    </text>
                  </vstack>
                ))}
          </hstack>
          <spacer grow={true}></spacer>
        </vstack>
      </blocks>
    );
  },
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create a countdown timer',
  onPress: async (_event, context) => {
    const { ui } = context;
    ui.showForm(CountdownForm);
  },
});

export default Devvit;
