import { BaseContext, ContextAPIClients, Devvit, Form, MediaPlugin } from '@devvit/public-api';
import {
  createDatetime,
  getHourOptions,
  getFormattedTimeLeft,
  getTimezones,
  getFormattedDueDate,
} from './utils.js';
import { parse } from 'tldts';
import { APPROVED_DOMAINS, ONE_MINUTE_IN_MS, POST_DATA_KEY } from './constants.js';
import {
  addUserReminder,
  getExistingReminders,
  removePostAssociatedData,
  removeUserReminder,
  setPostReminder,
} from './reminders.js';

Devvit.configure({
  redditAPI: true,
  kvStore: true,
  media: true,
  redis: true,
});

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
const TIMEZONE_VALUES: DropdownOption[] = getTimezones().map(mapValueToDropdownOption);

type CountdownFormData = {
  title: string;
  description?: string;
  date: string; // yyyy-mm-dd
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
  timezone?: string; // as in Intl.supportedValuesOf('timeZone'). e.g. Europe/Amsterdam
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
          { name: 'date', label: 'Countdown date (yyyy-mm-dd)', type: 'string', required: true },
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
            label: 'Timezone',
            type: 'select',
            required: true,
            defaultValue: ['America/New_York'],
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
  async (event, { reddit, kvStore, ui, subredditId, media, scheduler }) => {
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
      timezone: formData.timezone[0],
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

      await setPostReminder(postData.dateTime, scheduler, post.id, kvStore);

      ui.showToast(`Countdown created!`);
    } catch (e) {
      console.log(postData);
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
    const postId = context.postId || 'test';

    const [postAssociatedData] = context.useState(async () => {
      return await getPostAssociatedData(context);
    });

    if (!postAssociatedData) {
      return <ErrorState />;
    }

    const [currentUserId] = context.useState<string | null>(async () => {
      const user = await context.reddit.getCurrentUser();
      return user?.id;
    });

    const [isReminderActive, setIsReminderActive] = context.useState<boolean>(async () => {
      if (!currentUserId) {
        return false;
      }
      const reminders = await getExistingReminders(postId, context.kvStore);
      return reminders.includes(currentUserId);
    });

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

    const formattedDueDate = getFormattedDueDate(
      postAssociatedData.dateTime,
      postAssociatedData.timezone
    );
    const formattedTimeLeft = getFormattedTimeLeft(timeLeft);
    const hasLink = postAssociatedData.link_url;
    const renderEventHappened = () => {
      if (!hasLink) {
        return (
          <text style="heading" size="xxlarge">
            It happened!
          </text>
        );
      }
      return (
        <button
          width={50}
          onPress={() => {
            context.ui.showForm(linkForm);
          }}
        >
          {postAssociatedData.link_title || 'Click here!'}
        </button>
      );
    };

    const renderContentCountdown = () => {
      if (!formattedTimeLeft) {
        return undefined;
      }
      return formattedTimeLeft.map((remainingTimeEntry) => (
        <vstack>
          <text size="large" weight="bold" alignment="center">
            {remainingTimeEntry.value || '0'}
          </text>
          <text size="small" weight="regular" alignment="center">
            {remainingTimeEntry.label}
          </text>
        </vstack>
      ));
    };

    const toggleReminder = async () => {
      // impossible in practice, just a typeguard
      if (!currentUserId) {
        return;
      }

      // the redundancy here is intentional
      // this way we make sure that we do exactly what user expects us to do
      await (isReminderActive
        ? removeUserReminder(currentUserId, postId, context.kvStore)
        : addUserReminder(currentUserId, postId, context.kvStore));
      setIsReminderActive(!isReminderActive);
    };

    const isEnoughTimeForReminder = timeLeft > 2 * ONE_MINUTE_IN_MS;

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
          {!formattedTimeLeft ? (
            <hstack gap="medium" alignment="center">
              {renderEventHappened()}
            </hstack>
          ) : (
            <>
              <hstack gap="medium" alignment="center">
                {renderContentCountdown()}
              </hstack>
              {currentUserId && isEnoughTimeForReminder && (
                <>
                  <spacer size="medium" />
                  <button
                    icon={!isReminderActive ? 'notification-outline' : 'notification-frequent-fill'}
                    appearance="primary"
                    onPress={toggleReminder}
                  >
                    {!isReminderActive ? 'Remind me' : 'Reminder set'}
                  </button>
                </>
              )}
            </>
          )}
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

// Clearing up reminder on a PostDelete event
Devvit.addTrigger({
  event: 'PostDelete',
  onEvent: async (event, context) => {
    const postId = event.postId;
    await removePostAssociatedData(postId, context.kvStore, context.scheduler);
  },
});

export default Devvit;
