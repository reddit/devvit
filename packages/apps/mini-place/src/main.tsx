import { Devvit } from '@devvit/public-api';

const colors = [
  '#FFFFFF',
  '#000000',
  '#EB5757',
  '#F2994A',
  '#F2C94C',
  '#27AE60',
  '#2F80ED',
  '#9B51E0',
];

const resolution = 8;
const size = 32;
const blankCanvas = new Array(resolution * resolution).fill(0);
const defaultColor = 1;

type Payload = {
  index: number;
  color: number;
};

type RealtimeMessage = {
  payload: Payload;
  session: string;
  postId: string;
};

function sessionId(): string {
  let id = '';
  const asciiZero = '0'.charCodeAt(0);
  for (let i = 0; i < 4; i++) {
    id += String.fromCharCode(Math.floor(Math.random() * 26) + asciiZero);
  }
  return id;
}

// Data structure for the canvas in Redis
//
// {t3_aaaaaa :
//   "0" : "0",
//   "1" : "0",
//   "2" : "5"
// }
//

Devvit.addCustomPostType({
  name: 'Name',
  render: (context) => {
    const { useState, useChannel, redis, postId } = context;
    const mySession = sessionId();
    const myPostId = postId ?? 'defaultPostId';
    const [activeColor, setActiveColor] = useState(defaultColor);
    const [data, setData] = useState(async () => {
      const canvasData = await redis.hgetall(myPostId);
      if (canvasData) {
        const canvasArray = new Array(resolution * resolution).fill(0);
        for (const key in canvasData) {
          const index = parseInt(key);
          const color = parseInt(canvasData[key]);
          canvasArray[index] = color;
        }
        return canvasArray;
      }
      return blankCanvas;
    });

    function updateCanvas(index: number, color: number): void {
      const newData = data;
      newData[index] = color;
      setData(newData);
    }

    const channel = useChannel<RealtimeMessage>({
      name: 'events',
      onMessage: (msg) => {
        if (msg.session === mySession || msg.postId !== myPostId) {
          //Ignore my updates b/c they have already been rendered
          return;
        }
        const payload = msg.payload;
        updateCanvas(payload.index, payload.color);
      },
    });

    channel.subscribe();

    const ColorSelector = (): JSX.Element => (
      <hstack width="100%" alignment="center">
        {/* nested hstack to negate grow */}
        <hstack border="thin" grow={false} cornerRadius="small">
          {colors.map((color, index) => (
            <hstack
              height={`${size}px`}
              width={`${size}px`}
              backgroundColor={color}
              onPress={() => setActiveColor(index)}
              alignment="middle center"
            >
              {activeColor === index && (
                <text color={index === 1 ? 'white' : 'black'} weight="bold" size="xxlarge">
                  ✓
                </text>
              )}
            </hstack>
          ))}
        </hstack>
      </hstack>
    );

    const pixels = data.map((pixel, index) => (
      <hstack
        onPress={async () => {
          updateCanvas(index, activeColor);
          const payload: Payload = { index, color: activeColor };
          const message: RealtimeMessage = { payload, session: mySession, postId: myPostId };
          await channel.send(message);
          await redis.hset(myPostId, { [index.toString()]: activeColor.toString() });
        }}
        height={`${size}px`}
        width={`${size}px`}
        backgroundColor={colors[pixel]}
      />
    ));

    const gridSize = `${resolution * size}px`;

    function splitArray<T>(array: T[], segmentLength: number): T[][] {
      const result: T[][] = [];
      for (let i = 0; i < array.length; i += segmentLength) {
        result.push(array.slice(i, i + segmentLength));
      }
      return result;
    }

    const Canvas = (): JSX.Element => (
      <vstack cornerRadius="small" border="thin" height={gridSize} width={gridSize}>
        {splitArray(pixels, resolution).map((row) => (
          <hstack>{row}</hstack>
        ))}
      </vstack>
    );

    return (
      <blocks>
        <vstack gap="small" width="100%" height="100%" alignment="center middle">
          <Canvas />
          <ColorSelector />
        </vstack>
      </blocks>
    );
  },
});

// Define what packages you want to use here
// Others include:
// kvStore: a simple key value store for persisting data across sessions within this installation
// media: used for importing and posting images
Devvit.configure({
  redditAPI: true, // context.reddit will now be available
  realtime: true,
  redis: true,
});

/*
 * Use a menu action to create a custom post
 */
Devvit.addMenuItem({
  label: 'New Mini Place',
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
            Loading custom post hello world...
          </text>
        </vstack>
      ),
      title: `Mini Place`,
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Successfully created a Mini Place!`,
      appearance: 'success',
    });
  },
});

export default Devvit;
