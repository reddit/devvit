import { Devvit } from '@devvit/public-api';

import { getUserTiles, setUserTiles } from '../api/api.js';
import { BINGO_TILES_COUNT, staticColors, theme } from '../constants.js';
import type { TileItem } from '../types.js';
import type { ThemeConfig } from '../types.js';
import { getAllMatches, getCommentRichtext, shuffleArray } from '../utils/utils.js';
import { Tile } from './Tile.js';
import { TileDetails } from './TileDetails.js';

const createTile = (answer: string): TileItem => ({ text: answer, active: false });

function ShareConfirmation(props: {
  closeConfirmationModal: () => void;
  onConfirmation: () => Promise<void>;
  isLoading: boolean;
}): JSX.Element {
  return (
    <vstack width={100} height={100} backgroundColor="#00000099" alignment="center middle">
      <vstack
        maxWidth="300px"
        padding="medium"
        backgroundColor="neutral-background-weak"
        cornerRadius="large"
      >
        <hstack alignment="middle start" width={100} grow>
          <icon name={'warning-fill'} color="neutral-content-strong" />
          <spacer size="medium" />
          <text grow wrap width={100}>
            You are about to share a snapshot of your board as a comment. Continue?
          </text>
        </hstack>
        <spacer size="small" />
        <hstack alignment="end middle">
          <button
            appearance="plain"
            onPress={props.closeConfirmationModal}
            disabled={props.isLoading}
          >
            Cancel
          </button>
          <button appearance="plain" onPress={props.onConfirmation} disabled={props.isLoading}>
            Share
          </button>
        </hstack>
      </vstack>
    </vstack>
  );
}

function ShareSuccess(props: { closeSuccess: () => void; onViewClick: () => void }): JSX.Element {
  return (
    <vstack width={100} height={100} backgroundColor="#00000099" alignment="center middle">
      <vstack maxWidth="300px" padding="medium" backgroundColor="#0E8A00" cornerRadius="large">
        <hstack alignment="middle start" width={100} grow>
          <icon name={'checkmark-fill'} color="white" />
          <spacer size="medium" />
          <text grow wrap width={100} color="white">
            A snapshot of your board was posted to the comments.
          </text>
        </hstack>
        <spacer size="small" />
        <hstack alignment="end middle">
          <button appearance="success" onPress={props.closeSuccess}>
            Close
          </button>
          {/*<button appearance="success" onPress={props.onViewClick}>*/}
          {/*  View Comment*/}
          {/*</button>*/}
        </hstack>
      </vstack>
    </vstack>
  );
}

export const App = (context: Devvit.Context): JSX.Element => {
  // Get the current user
  const [currentUserName] = context.useState<string | null>(async () => {
    if (!context.userId) {
      return null;
    }
    const user = await context.reddit.getUserById(context.userId);
    return user?.username;
  });
  const [isEasyEyeMode, setIsEasyEyeMode] = context.useState<boolean>(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = context.useState<boolean>(false);
  const [isSuccessVisible, setIsSuccessVisible] = context.useState<boolean>(false);
  const [latestCommentLink, setLatestCommentLink] = context.useState<string | null>(null);
  const [activeTile, setActiveTile] = context.useState<{
    text: string;
    active: boolean;
    index: number;
  } | null>(null);
  const [tiles, setTiles] = context.useState<TileItem[]>(async () => {
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

    const shuffledTiles: TileItem[] = shuffleArray(answers)
      .slice(0, BINGO_TILES_COUNT)
      .map(createTile);
    await setUserTiles(context.redis, context.postId!, currentUserName, shuffledTiles);
    return shuffledTiles;
  });

  const [themeConfig] = context.useState<ThemeConfig>(async () => {
    const postThemeConfigJSON = await context.redis.get(`${context.postId}_theme`);
    if (!postThemeConfigJSON) {
      return theme.standard;
    }

    const postThemeConfig = JSON.parse(postThemeConfigJSON) as ThemeConfig;
    if (!postThemeConfig) {
      return theme.standard;
    }

    return {
      appBgImg: postThemeConfig.appBgImg || '',
      logoImg: postThemeConfig.logoImg || theme.standard.logoImg,
      logoImgWidth: postThemeConfig.logoImgWidth || theme.standard.logoImgWidth,
      appBackgroundColor: postThemeConfig.appBackgroundColor || theme.standard.appBackgroundColor,
      tileBg: postThemeConfig.tileBg || theme.standard.tileBg,
      tileBgActive: postThemeConfig.tileBgActive || theme.standard.tileBgActive,
      tileBorder: postThemeConfig.tileBorder || theme.standard.tileBorder,
      tileBorderActive: postThemeConfig.tileBorderActive || theme.standard.tileBorderActive,
      tileText: postThemeConfig.tileText || theme.standard.tileText,
      tileTextActive: postThemeConfig.tileTextActive || theme.standard.tileTextActive,
    };
  });

  const [lastSyncedTiles, setLastSyncedTiles] = context.useState<TileItem[]>(
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
  } else {
    interval.stop();
  }

  const saveTilesState = (newTiles: TileItem[]): void => {
    setTiles(newTiles);
  };

  const onSharePress = (): void => {
    showConfirmationModal();
  };

  const showConfirmationModal = (): void => {
    setIsConfirmationVisible(true);
  };

  const onConfirmation = async (): Promise<void> => {
    await shareSnapshot();
  };

  const closeConfirmationModal = (): void => {
    setIsConfirmationVisible(false);
  };

  const closeSuccessModal = (): void => {
    setLatestCommentLink(null);
    setIsSuccessVisible(false);
  };

  const shareSnapshot = async (): Promise<void> => {
    if (!currentUserName) {
      return;
    }
    await syncSelectedOptions();
    const visualTiles = tiles.map((tile) => (tile.active ? '🟩' : '🟥'));

    const matches = getAllMatches(tiles);
    //submit the comment to the post as app account
    const comment = await context.reddit.submitComment({
      id: context.postId!,
      richtext: getCommentRichtext(visualTiles, matches),
    });
    const link = new URL(comment.permalink, 'https://www.reddit.com').toString();
    setLatestCommentLink(link);
    closeConfirmationModal();
    setIsSuccessVisible(true);
  };

  const openComment = (): void => {
    if (latestCommentLink === null) {
      return;
    }

    context.ui.navigateTo(latestCommentLink);
    // this is just a fallback if navigation fails for some reason
    closeSuccessModal();
  };

  const onTilePress = (index: number): void => {
    if (!isEasyEyeMode) {
      toggleTileActiveStatus(index);
      return;
    }

    const selectedTile = tiles[index];
    setActiveTile({
      text: selectedTile.text,
      active: selectedTile.active,
      index,
    });
  };

  const toggleTileActiveStatus = (index: number): void => {
    const newTiles = [...tiles];

    // We're flipping the active cell
    newTiles[index].active = !newTiles[index].active;
    saveTilesState(newTiles);
  };

  const onCloseTileDetails = (): void => {
    setActiveTile(null);
  };

  const onToggleTileDetails = (): void => {
    if (!activeTile) {
      return;
    }
    toggleTileActiveStatus(activeTile.index);
    onCloseTileDetails();
  };

  const renderTileRow = (index: number, tile: TileItem): JSX.Element => (
    <>
      <Tile
        isEasyEyeMode={isEasyEyeMode}
        text={tile.text}
        active={tile.active}
        onPress={() => onTilePress(index)}
        themeConfig={themeConfig}
      />
    </>
  );

  const bgImage = themeConfig.appBgImg;
  return (
    <zstack
      alignment="center middle"
      height="100%"
      width="100%"
      backgroundColor={themeConfig.appBackgroundColor}
    >
      {bgImage ? (
        <image
          url={bgImage}
          imageWidth={770}
          imageHeight={320}
          width={100}
          height={100}
          resizeMode="cover"
          description="Bingo board background"
        />
      ) : null}
      {!isConfirmationVisible && !isSuccessVisible && (
        <vstack alignment="top center" height="100%" width="100%">
          <hstack alignment="start middle" height="46px" width="100%">
            <hstack height={100} width={100} alignment="center middle">
              <vstack width="8px" />
              <image
                url={themeConfig.logoImg}
                imageWidth={`${themeConfig.logoImgWidth}px`}
                imageHeight="32px"
                width={`${themeConfig.logoImgWidth}px`}
                height="32px"
              />
              <spacer grow />
              <hstack
                width="32px"
                height="32px"
                backgroundColor={
                  isEasyEyeMode ? staticColors.topRowButtonBgActive : staticColors.topRowButtonBg
                }
                onPress={() => setIsEasyEyeMode(!isEasyEyeMode)}
                alignment="center middle"
                cornerRadius="full"
              >
                <icon
                  name="text-size-outline"
                  color={
                    isEasyEyeMode
                      ? staticColors.topRowButtonTextActive
                      : staticColors.topRowButtonText
                  }
                  size="small"
                />
              </hstack>
              {currentUserName ? (
                <>
                  <spacer size="xsmall" />
                  <hstack
                    width="32px"
                    height="32px"
                    backgroundColor={staticColors.topRowButtonBg}
                    onPress={onSharePress}
                    alignment="center middle"
                    cornerRadius="full"
                  >
                    <icon name="share" color={staticColors.topRowButtonText} size="small" />
                  </hstack>
                </>
              ) : null}
              <vstack width="8px" />
            </hstack>
          </hstack>

          <hstack>
            <vstack width="8px" />
            <vstack grow alignment="middle center" border="thick" borderColor="transparent">
              <hstack alignment="middle center">
                {tiles.slice(0, 4).map((tile, index) => renderTileRow(index, tile))}
              </hstack>

              <hstack alignment="middle center">
                {tiles.slice(4, 8).map((tile, index) => renderTileRow(index + 4, tile))}
              </hstack>

              <hstack alignment="middle center">
                {tiles.slice(8, 12).map((tile, index) => renderTileRow(index + 8, tile))}
              </hstack>

              <hstack alignment="middle center">
                {tiles.slice(12, 16).map((tile, index) => renderTileRow(index + 12, tile))}
              </hstack>
            </vstack>
            <vstack width="8px" />
          </hstack>
        </vstack>
      )}
      {isConfirmationVisible && (
        <ShareConfirmation
          closeConfirmationModal={closeConfirmationModal}
          onConfirmation={onConfirmation}
          isLoading={false}
        />
      )}
      {isSuccessVisible && (
        <ShareSuccess closeSuccess={closeSuccessModal} onViewClick={openComment} />
      )}
      {isEasyEyeMode && activeTile && (
        <TileDetails
          text={activeTile.text}
          active={activeTile.active}
          onClose={onCloseTileDetails}
          onToggle={onToggleTileDetails}
        />
      )}
    </zstack>
  );
};
