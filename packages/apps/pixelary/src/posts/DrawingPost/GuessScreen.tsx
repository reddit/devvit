import type { Context } from '@devvit/public-api';
import { Devvit, useAsync, useForm, useState } from '@devvit/public-api';

import { Drawing } from '../../components/Drawing.js';
import { HeroButton } from '../../components/HeroButton.js';
import { LoadingState } from '../../components/LoadingState.js';
import { PixelText } from '../../components/PixelText.js';
import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';
import type { DrawingPostData, PostGuesses, UserData } from '../../types.js';

interface GuessScreenProps {
  postData: DrawingPostData;
  userData: UserData | null;
  username: string | null;
  onGuess: (guess: string, userWantsToComment: boolean) => Promise<void>;
  onSkip: () => void;
  feedback: boolean | null;
}

export const GuessScreen = (props: GuessScreenProps, context: Context): JSX.Element => {
  const service = new Service(context);

  const { data, loading } = useAsync<PostGuesses>(async () => {
    const empty = { playerCount: 0, wordCount: 0, guessCount: 0, guesses: {} };
    if (!props.username) return empty;
    try {
      const players = await service.getPlayerCount(props.postData.postId);
      const metadata = await service.getPostGuesses(props.postData.postId);
      metadata.playerCount = players;
      return metadata;
    } catch (error) {
      if (error) {
        console.error('Error loading drawing meta data', error);
      }
      return empty;
    }
  });

  const [guessCount, setGuessCount] = useState(props.userData?.guessCount ?? 0);

  if (loading || data === null) return <LoadingState />;

  const playerCount = data.playerCount ?? 0;
  const width = 295;

  // Guess the word form
  const guessForm = useForm(
    {
      title: 'Guess the word',
      description: "If you're right, you'll earn 1 point.",
      acceptLabel: 'Submit Guess',
      fields: [
        {
          type: 'string',
          name: 'guess',
          label: 'Word',
          required: true,
        },
        {
          type: 'boolean',
          name: 'comment',
          label: 'Leave a comment (optional)',
          defaultValue: false,
        },
      ],
    },
    async (values) => {
      setGuessCount((c) => c + 1);
      const guess = values.guess.trim().toLowerCase();
      const userWantsToComment = values.comment;
      await props.onGuess(guess, userWantsToComment);
    }
  );

  // Give up form
  const giveUpForm = useForm(
    {
      title: 'Giving up already?',
      description:
        "You'll see the word and lose your chance to earn points. Ready to call it quits?",
      acceptLabel: 'I Give Up',
      cancelLabel: 'Back',
      fields: [],
    },
    async () => {
      if (!props.postData.postId || !props.username) {
        return;
      }
      await service.skipPost(props.postData.postId, props.username);
      props.onSkip();
    }
  );

  const dictionaryName = props.postData.dictionaryName;

  return (
    <zstack height="100%" width="100%">
      <vstack height="100%" width="100%" alignment="center middle">
        {/* Drawing */}
        <zstack alignment="center middle">
          <Drawing data={props.postData.data} size={width} shadowOffset={8} />
          {props.feedback === false && (
            <image
              url={'feedback-incorrect.png'}
              imageHeight={512}
              imageWidth={512}
              height="256px"
              width="256px"
            />
          )}
        </zstack>
        <spacer height="8px" />

        {/* Guess Button */}
        <HeroButton
          label="WHAT IS THIS?"
          onPress={() => context.ui.showForm(guessForm)}
          animated={guessCount < 2}
        />

        <spacer height="16px" />

        {/* Metadata */}
        <PixelText color={Settings.theme.secondary}>
          {playerCount > 0
            ? `${playerCount.toLocaleString()} have guessed`
            : 'Make the first guess!'}
        </PixelText>
      </vstack>

      {/* Overlay */}
      <vstack height="100%" width="100%" alignment="center middle">
        <spacer height="16px" />

        {/* Dictionary */}
        {dictionaryName && dictionaryName !== 'main' && (
          <hstack alignment="middle center">
            <image
              url={`data:image/svg+xml,
                <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6 4H4V6H2V8H0V12H2V14H6V12H8V10H10V8H12V6H14V0H8V2H6V4ZM10 2H12V4H10V2Z" fill="${Settings.theme.secondary}" />
</svg>
                `}
              imageHeight={14}
              imageWidth={14}
              height="14px"
              width="14px"
            />
            <spacer width="8px" />
            <PixelText
              color={Settings.theme.secondary}
            >{`${dictionaryName} ${dictionaryName.startsWith('r/') ? 'takeover' : 'event'}`}</PixelText>
          </hstack>
        )}
        <spacer grow />

        {/* Give up button */}
        {guessCount > 0 && (
          <image
            imageHeight="34px"
            imageWidth="144px"
            height="34px"
            width="144px"
            description="GIVE UP"
            onPress={() => context.ui.showForm(giveUpForm)}
            url={`data:image/svg+xml,
<svg width="144" height="34" viewBox="0 0 144 34" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 8H10V20H12V8Z M24 24H26.0498V26H24V24Z M28.0371 24H30.1368V26H28.0371V24Z M32.1241 24H34.2238V26H32.1241V24Z M36.211 24H38.3107V26H36.211V24Z M40.298 24H42.3977V26H40.298V24Z M44.3849 24H46.4846V26H44.3849V24Z M48.4719 24H50.5716V26H48.4719V24Z M52.5589 24H54.6585V26H52.5589V24Z M56.6458 24H58.7455V26H56.6458V24Z M60.7328 24H62.8325V26H60.7328V24Z M64.8197 24H66.9194V26H64.8197V24Z M68.9067 24H71.0064V26H68.9067V24Z M72.9936 24H75.0933V26H72.9936V24Z M77.0806 24H79.1803V26H77.0806V24Z M81.1675 24H83.2672V26H81.1675V24Z M85.2545 24H87.3542V26H85.2545V24Z M89.3415 24H91.4411V26H89.3415V24Z M93.4284 24H95.5281V26H93.4284V24Z M97.5154 24H99.6151V26H97.5154V24Z M101.602 24H103.702V26H101.602V24Z M105.689 24H107.789V26H105.689V24Z M109.776 24H111.876V26H109.776V24Z M113.863 24H115.963V26H113.863V24Z M117.95 24H120V26H117.95V24Z M36 8H26V10H24V18H26V20H36V14H30V16H32V18H28V10H36V8Z M38 8H50V10H46V18H50V20H38V18H42V10H38V8Z M52 8H56V16H60V8H64V16H62V18H60V20H56V18H54V16H52V8Z M78 8H66V20H78V18H70V14H76V12H70V10H78V8Z M98 8H94V20H106V8H102V18H98V8Z M108 8V20H112V16H118V14H120V10H118V8H108ZM112 10V14H116V10H112Z M134 8H132V20H134V8Z" fill="${Settings.theme.tertiary}" />
<path d="M10 8H8V10H6V8H2V10H0V16H2V14H6V16H10V8Z M134 8H136V10H138V8H142V10H144V16H142V14H138V16H134V8Z" fill="white" />
</svg>`}
          />
        )}

        <spacer height="8px" />
      </vstack>
    </zstack>
  );
};
