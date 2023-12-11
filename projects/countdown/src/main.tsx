import { Devvit, MediaPlugin } from '@devvit/public-api';
import {
  CountdownData,
  CountdownFormData,
  createDatetime,
  getFormattedDueDate,
  getFormattedTimeLeft,
  getHourOptions,
  getPostAssociatedData,
  getTimezones,
  truncateString,
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
import { Preview } from './preview.js';

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

const CountdownForm = Devvit.createForm(
  {
    title: 'Create a Countdown Timer',
    fields: [
      { name: 'title', label: 'Post Title', type: 'string', required: true },
      {
        name: 'description',
        label: 'Description',
        type: 'string',
        defaultValue: 'Mark your calendar!',
        required: true,
      },
      {
        type: 'group',
        label: 'End Date and Time',
        fields: [
          { name: 'date', label: 'Countdown Date (yyyy-mm-dd)', type: 'string', required: true },
          {
            name: 'time',
            label: 'Countdown Time',
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
        label: 'Add a Link (optional)',
        fields: [
          { name: 'link_title', label: 'Link Label', type: 'string' },
          { name: 'link_url', label: 'Destination URL', type: 'string' },
        ],
      },
      {
        type: 'group',
        label: 'Add an Image (optional)',
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
    try {
      const formData = event.values as CountdownFormData;
      if (formData.img_url) {
        // check valid domain
        const domain = parse(formData.img_url).domain;
        if (!domain) {
          ui.showToast('Invalid image url provided');
          return;
        }
      }

      const targetCountdownDateTimeString = createDatetime(
        formData.date,
        formData.time[0],
        formData.timezone[0]
      );

      if (new Date(targetCountdownDateTimeString) <= new Date()) {
        ui.showToast(
          'Impossible to create the countdown with target date in the past. Please try a different date.'
        );
        return;
      }

      const postData: CountdownData = {
        title: formData.title || '',
        description: formData.description || '',
        dateTime: targetCountdownDateTimeString,
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

      const post = await reddit.submitPost({
        title: `[Countdown] ${postData.title}`,
        subredditName,
        preview: Preview(),
      });

      await kvStore.put(POST_DATA_KEY(post.id), postData);

      await setPostReminder(postData.dateTime, scheduler, post.id, kvStore);

      ui.showToast(`Countdown created!`);
    } catch (e) {
      console.log(event.values);
      ui.showToast('Something went wrong, please try again later.');
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

Devvit.addCustomPostType({
  name: 'Community Countdown',
  description: 'Mark the date!',
  render: (context) => {
    const postId = context.postId || 'test';

    const [postAssociatedData] = context.useState(async () => {
      return await getPostAssociatedData(context.postId, context.kvStore);
    });

    if (!postAssociatedData) {
      return <ErrorState />;
    }

    const [currentUserId] = context.useState<string | null>(async () => {
      const user = await context.reddit.getCurrentUser();
      return user?.id;
    });

    const [isReminderSet, setIsReminderSet] = context.useState<boolean>(async () => {
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

    const isCountdownActive = timeLeft > 0;

    const interval = context.useInterval(() => {
      setTimeLeft(timeLeft - 1000);
    }, 1000);

    if (isCountdownActive) {
      interval.start();
    } else {
      interval.stop();
    }

    const formattedDueDate = getFormattedDueDate(
      postAssociatedData.dateTime,
      postAssociatedData.timezone
    );

    const formattedTimeLeft = getFormattedTimeLeft(timeLeft);
    const hasLink = Boolean(postAssociatedData.link_url);
    const imgUrl = postAssociatedData.img_url;

    const renderLinkButton = () => {
      if (!postAssociatedData.link_url) {
        return undefined;
      }

      const linkTitle = truncateString(postAssociatedData.link_title || 'Click here!', 27, '…');

      return (
        <button
          size="medium"
          maxWidth="300px"
          appearance="primary"
          icon="external-outline"
          onPress={() => {
            context.ui.navigateTo(postAssociatedData.link_url!);
          }}
          disabled={isCountdownActive}
        >
          {linkTitle}
        </button>
      );
    };

    const renderContentCountdown = () => {
      if (!formattedTimeLeft) {
        return undefined;
      }
      return formattedTimeLeft.map((remainingTimeEntry) => (
        <vstack
          backgroundColor={imgUrl ? 'transparent' : '#E4EFFF'}
          cornerRadius="small"
          width={imgUrl ? '48px' : '68px'}
          height={imgUrl ? '52px' : '76px'}
        >
          <spacer grow />
          <text
            style="heading"
            size={imgUrl ? 'large' : 'xxlarge'}
            weight="bold"
            alignment="center"
            color={imgUrl ? 'neutral-content-strong' : '#0F1A1C'}
          >
            {remainingTimeEntry.value || '0'}
          </text>
          <text
            size="small"
            weight="regular"
            alignment="center"
            color={imgUrl ? 'neutral-content' : '#2A3C42'}
          >
            {remainingTimeEntry.label}
          </text>
          <spacer grow />
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
      await (isReminderSet
        ? removeUserReminder(currentUserId, postId, context.kvStore)
        : addUserReminder(currentUserId, postId, context.kvStore));
      const newReminderSetStatus = !isReminderSet;
      setIsReminderSet(newReminderSetStatus);
      context.ui.showToast(newReminderSetStatus ? 'Reminder set' : 'Reminder removed');
    };

    const isEnoughTimeForReminder = timeLeft > 2 * ONE_MINUTE_IN_MS;
    const isReminderActive = isEnoughTimeForReminder && isReminderSet;

    function renderReminderButton() {
      if (!currentUserId) {
        return undefined;
      }

      return (
        <button
          size="large"
          width="160px"
          icon={isReminderActive ? 'notification-frequent-fill' : 'notification-outline'}
          appearance="primary"
          onPress={toggleReminder}
          disabled={!isEnoughTimeForReminder}
        >
          {isReminderActive ? 'Reminder Set' : 'Remind Me'}
        </button>
      );
    }

    function renderSmallReminderButton() {
      if (!currentUserId) {
        return undefined;
      }

      return (
        <button
          size="small"
          icon={isReminderActive ? 'notification-frequent-fill' : 'notification-outline'}
          appearance={isEnoughTimeForReminder && !isReminderActive ? 'bordered' : 'primary'}
          onPress={toggleReminder}
          disabled={!isEnoughTimeForReminder}
        ></button>
      );
    }

    function renderPostBottom() {
      if (imgUrl) {
        return (
          <>
            <hstack gap={'none'} alignment="center">
              {!isCountdownActive && hasLink ? (
                <vstack>
                  <spacer size={'medium'} />
                  {renderLinkButton()}
                </vstack>
              ) : (
                renderContentCountdown()
              )}
            </hstack>
          </>
        );
      }
      return (
        <>
          <hstack gap={imgUrl ? 'none' : 'small'} alignment="center">
            {renderContentCountdown()}
          </hstack>
          <>
            <spacer size={imgUrl ? 'small' : 'large'} />
            {hasLink ? renderLinkButton() : renderReminderButton()}
          </>
        </>
      );
    }

    return (
      <blocks height="regular">
        <zstack width={100} height={100} grow>
          <vstack alignment="center" height={100} width={100}>
            <spacer grow></spacer>
            <hstack width={100}>
              <spacer width="56px" />
              <text
                style="heading"
                size="xlarge"
                alignment="center"
                grow
                color="neutral-content-strong"
                overflow="ellipsis"
                maxWidth="90%"
              >
                {postAssociatedData.description}
              </text>
              <spacer width="56px" />
            </hstack>
            <spacer size="xsmall"></spacer>
            <text
              style="heading"
              size="small"
              weight="regular"
              alignment="center"
              color="neutral-content"
            >
              {formattedDueDate}
            </text>
            {!imgUrl ? (
              <spacer size="large"></spacer>
            ) : (
              <>
                <spacer size="xsmall"></spacer>
                <hstack alignment="center" padding="small">
                  <vstack cornerRadius="large">
                    <image
                      url={imgUrl}
                      imageWidth={120}
                      imageHeight={120}
                      resizeMode="cover"
                    ></image>
                  </vstack>
                </hstack>
              </>
            )}

            {renderPostBottom()}
            <spacer grow={true}></spacer>
          </vstack>
          {hasLink || imgUrl ? (
            <hstack padding="small" width={100}>
              <spacer grow></spacer>
              {renderSmallReminderButton()}
            </hstack>
          ) : undefined}
        </zstack>
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
