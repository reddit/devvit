import { Devvit } from '@devvit/public-api';

// array of default tiles
const defaultTiles = [
  { text: 'A0', active: false },
  { text: 'A1', active: false },
  { text: 'A2', active: false },
  { text: 'A3', active: false },
  { text: 'A4', active: false },
  { text: 'A5', active: false },
  { text: 'A6', active: false },
  { text: 'A7', active: false },
  { text: 'A8', active: false },
  { text: 'A9', active: false },
  { text: 'A10', active: false },
  { text: 'A11', active: false },
  { text: 'A12', active: false },
  { text: 'A13', active: false },
  { text: 'A14', active: false },
  { text: 'A15', active: false },
];

type TileProps = {
  text: string;
  active: boolean;
  onPress: () => void;
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

export const App = (context: Devvit.Context): JSX.Element => {
  const { useState } = context;
  const [tiles, setTiles] = useState(defaultTiles);

  //set tiles = answers from redis
  useState(async () => {
    const answersJSON = await context.redis.get(context.postId!);
    const a = JSON.parse(answersJSON!);
    setTiles(tiles.map((tile, index) => ({ ...tile, text: a[index] })));
  });

  // Get the current user
  const [currentUser] = context.useState<string | null>(async () => {
    const user = await context.reddit.getCurrentUser();
    return user?.username;
  });

  return (
    <zstack alignment="center middle" height="100%" width="100%">
      <image
        url="https://preview.redd.it/bingo-background-v0-43tm3konddlc1.png?auto=webp&s=7e3c1eace90e358fc3efb63e4992b8c0106bad1f"
        imageWidth={770}
        imageHeight={320}
        description="Bingo board background"
      />
      <vstack alignment="top center" height="100%" width="100%">
        <hstack padding="small" alignment="start middle" height="40px" width="100%">
          <button
            size="small"
            icon="link"
            appearance="primary"
            onPress={() => {
              context.ui.showToast('Link button pressed!');
              // Need to add the link to the post
            }}
          >
            Event
          </button>
          <spacer size="medium" grow />
          <text size="medium" weight="bold" color="black">
            {currentUser}'s board
          </text>
          <spacer size="medium" grow />
          <button
            size="small"
            icon="share"
            appearance="primary"
            onPress={async () => {
              let sharable = '';
              let counter = 0;

              tiles.forEach((tile, index) => {
                if (tile.active) {
                  sharable += '🟩';
                } else if (!tile.active) {
                  sharable += '🟥';
                } else {
                  console.log('error adding tile to sharable string');
                }
                counter++;
                if (counter % 4 === 0) {
                  sharable += `\n\n`;
                }
              });

              //submit the comment to the post as app account
              await context.reddit.submitComment({
                id: context.postId!,
                text: `u/${currentUser}` + `'s bingo results: \n\n` + `${sharable}`,
              });
              context.ui.showToast('Shared to comments!');
            }}
          >
            Share
          </button>
        </hstack>

        <vstack width="100%" alignment="middle center" padding="small" gap="small">
          <hstack alignment="middle center" gap="small">
            {tiles.slice(0, 4).map((tile, index) => (
              <Tile
                text={tile.text}
                active={tile.active}
                onPress={() => {
                  // Making a copy of the tiles so we can make changes
                  const newTiles = tiles;

                  // We're flipping the active cell
                  newTiles[index].active = !newTiles[index].active;
                  setTiles(newTiles);
                }}
              />
            ))}
          </hstack>

          <hstack alignment="middle center" gap="small">
            {tiles.slice(4, 8).map((tile, index) => (
              <Tile
                text={tile.text}
                active={tile.active}
                onPress={() => {
                  const adjustedIndex = index + 4;
                  const newTiles = tiles;

                  newTiles[adjustedIndex].active = !newTiles[adjustedIndex].active;
                  setTiles(newTiles);
                }}
              />
            ))}
          </hstack>

          <hstack alignment="middle center" gap="small">
            {tiles.slice(8, 12).map((tile, index) => (
              <Tile
                text={tile.text}
                active={tile.active}
                onPress={() => {
                  const adjustedIndex = index + 8;
                  const newTiles = tiles;

                  newTiles[adjustedIndex].active = !newTiles[adjustedIndex].active;
                  setTiles(newTiles);
                }}
              />
            ))}
          </hstack>

          <hstack alignment="middle center" gap="small">
            {tiles.slice(12, 16).map((tile, index) => (
              <Tile
                text={tile.text}
                active={tile.active}
                onPress={() => {
                  const adjustedIndex = index + 12;
                  const newTiles = tiles;

                  newTiles[adjustedIndex].active = !newTiles[adjustedIndex].active;
                  setTiles(newTiles);
                }}
              />
            ))}
          </hstack>
        </vstack>
      </vstack>
    </zstack>
  );
};
