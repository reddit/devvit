import { Devvit } from '@devvit/public-api';
import { getCommentRichtext, shuffleArray } from '../utils/utils.js';
import { Tile } from '../types.js';
import { getUserTiles, setUserTiles } from '../api/api.js';

type TileProps = {
  text: string;
  active: boolean;
  onPress: () => void | Promise<void>;
};

const createTile = (answer: string): Tile => ({ text: answer, active: false });

export const App = (context: Devvit.Context): JSX.Element => {
  // Get the current user
  const [currentUserName] = context.useState<string | null>(async () => {
    const user = await context.reddit.getCurrentUser();
    return user?.username;
  });
  const [isConfirmationVisible, setIsConfirmationVisible] = context.useState<boolean>(false);
  const [tiles, setTiles] = context.useState<Tile[]>(async () => {
    if (currentUserName) {
      const userTiles = await getUserTiles(context.redis, context.postId!, currentUserName);
      if (userTiles) {
        return userTiles;
      }
    }

    const answersJSON = await context.redis.get(context.postId!);
    const answers = JSON.parse(answersJSON!) as string[];
    if (!currentUserName) {
      return answers.map(createTile);
    }

    const shuffledTiles: Tile[] = shuffleArray(answers).map(createTile);
    await setUserTiles(context.redis, context.postId!, currentUserName, shuffledTiles);
    return shuffledTiles;
  });

  const [lastSyncedTiles, setLastSyncedTiles] = context.useState<Tile[]>(
    JSON.parse(JSON.stringify(tiles))
  );

  async function syncSelectedOptions(): Promise<void> {
    if (!currentUserName) {
      return;
    }
    const currentStateStringified = JSON.stringify(tiles);
    const syncedStateStringified = JSON.stringify(lastSyncedTiles);
    if (currentStateStringified === syncedStateStringified) {
      return;
    }
    await setUserTiles(context.redis, context.postId!, currentUserName, tiles);
    setLastSyncedTiles(JSON.parse(currentStateStringified));
  }

  const interval = context.useInterval(async () => {
    await syncSelectedOptions();
  }, 1000);

  if (currentUserName) {
    interval.start();
  }

  const saveTilesState = async (newTiles: Tile[]): Promise<void> => {
    setTiles(newTiles);
  };

  const onSharePress = (): void => {
    showConfirmationModal();
  };

  const showConfirmationModal = (): void => {
    setIsConfirmationVisible(true);
  };

  const onConfirmation = async (): Promise<void> => {
    closeConfirmationModal();
    await shareSnapshot();
  };

  const closeConfirmationModal = (): void => {
    setIsConfirmationVisible(false);
  };

  const shareSnapshot = async (): Promise<void> => {
    if (!currentUserName) {
      return;
    }
    await syncSelectedOptions();
    const visualTiles = tiles.map((tile) => (tile.active ? '🟩' : '🟥'));

    //submit the comment to the post as app account
    const comment = await context.reddit.submitComment({
      id: context.postId!,
      richtext: getCommentRichtext(visualTiles, currentUserName),
    });
    context.ui.showToast('Shared to comments!');
    context.ui.navigateTo(comment);
  };

  const onTilePress = async (index: number): Promise<void> => {
    const newTiles = [...tiles];

    // We're flipping the active cell
    newTiles[index].active = !newTiles[index].active;
    await saveTilesState(newTiles);
  };

  return (
    <zstack alignment="center middle" height="100%" width="100%">
      <image
        url="https://preview.redd.it/bingo-background-v0-43tm3konddlc1.png?auto=webp&s=7e3c1eace90e358fc3efb63e4992b8c0106bad1f"
        imageWidth={770}
        imageHeight={320}
        width={100}
        height={100}
        resizeMode="cover"
        description="Bingo board background"
      />
      {!isConfirmationVisible && (
        <vstack alignment="top center" height="100%" width="100%">
          <hstack alignment="start middle" height="40px" width="100%">
            <zstack width={100} height={100}>
              <hstack padding="small" height={100} width={100} alignment="center middle">
                {/*<button*/}
                {/*  size="small"*/}
                {/*  icon="link"*/}
                {/*  appearance="primary"*/}
                {/*  onPress={() => {*/}
                {/*    context.ui.showToast('Link button pressed!');*/}
                {/*    // Need to add the link to the post*/}
                {/*  }}>*/}
                {/*  Event*/}
                {/*</button>*/}
                <spacer grow />
                {currentUserName ? (
                  <button size="small" icon="share" appearance="primary" onPress={onSharePress}>
                    Share
                  </button>
                ) : null}
              </hstack>
              <hstack height={100} width={100} alignment="center middle">
                <text size="medium" weight="bold" color="black">
                  {currentUserName}'s board
                </text>
              </hstack>
            </zstack>
          </hstack>

          <vstack width="100%" alignment="middle center" padding="small" gap="small">
            <hstack alignment="middle center" gap="small">
              {tiles.slice(0, 4).map((tile, index) => {
                return (
                  <Tile text={tile.text} active={tile.active} onPress={() => onTilePress(index)} />
                );
              })}
            </hstack>

            <hstack alignment="middle center" gap="small">
              {tiles.slice(4, 8).map((tile, index) => (
                <Tile
                  text={tile.text}
                  active={tile.active}
                  onPress={() => onTilePress(index + 4)}
                />
              ))}
            </hstack>

            <hstack alignment="middle center" gap="small">
              {tiles.slice(8, 12).map((tile, index) => (
                <Tile
                  text={tile.text}
                  active={tile.active}
                  onPress={() => onTilePress(index + 8)}
                />
              ))}
            </hstack>

            <hstack alignment="middle center" gap="small">
              {tiles.slice(12, 16).map((tile, index) => (
                <Tile
                  text={tile.text}
                  active={tile.active}
                  onPress={() => onTilePress(index + 12)}
                />
              ))}
            </hstack>
          </vstack>
        </vstack>
      )}
      {isConfirmationVisible && (
        <vstack width={100} height={100} backgroundColor="#00000099" alignment="center middle">
          <vstack
            maxWidth="300px"
            padding="medium"
            backgroundColor="neutral-background-weak"
            cornerRadius="large"
          >
            <hstack alignment="middle start">
              <icon name={'warning-fill'} />
              <spacer size="medium" />
              <vstack grow>
                <text wrap>
                  You are about to share a snapshot of your board as a comment. Continue?
                </text>
              </vstack>
            </hstack>
            <spacer size="small" />
            <hstack alignment="end middle">
              <button appearance="plain" onPress={closeConfirmationModal}>
                Cancel
              </button>
              <button appearance="plain" onPress={onConfirmation}>
                Share
              </button>
            </hstack>
          </vstack>
        </vstack>
      )}
    </zstack>
  );
};

const Tile = (props: TileProps): JSX.Element => {
  const { text, active, onPress } = props;
  return (
    <hstack
      backgroundColor={active ? '#55BD46' : '#FFFFFF'} //selected : unselected
      height="60px"
      width="60px"
      cornerRadius="small"
      borderColor="#000000"
      onPress={onPress}
    >
      <text
        alignment="middle center"
        color={active ? 'white' : 'black'}
        size="xsmall"
        weight="bold"
        height="100%"
        width="100%"
        wrap={true}
      >
        {text}
      </text>
    </hstack>
  );
};
