import { Devvit } from '@devvit/public-api';

Devvit.configure({
  realtime: true,
  redditAPI: true,
});

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
};

function sessionId(): string {
  let id = '';
  const asciiZero = '0'.charCodeAt(0);
  for (let i = 0; i < 4; i++) {
    id += String.fromCharCode(Math.floor(Math.random() * 26) + asciiZero);
  }
  return id;
}

Devvit.addCustomPostType({
  name: 'Name',
  render: (context) => {
    const { useState, useChannel } = context;
    const mySession = sessionId();
    const [activeColor, setActiveColor] = useState(defaultColor);
    const [data, setData] = useState(blankCanvas);

    function updateCanvas(index: number, color: number): void {
      const newData = data;
      newData[index] = color;
      setData(newData);
    }

    const channel = useChannel({
      name: 'events',
      onMessage: (data) => {
        const msg = data as RealtimeMessage;
        if (msg.session === mySession) {
          // Ignore my updates b/c they have already been rendered
          return;
        }
        const payload = msg.payload;
        updateCanvas(payload.index, payload.color);
      },
      onSubscribed: () => {
        // handle connection setup
      },
    });

    // subscribe to the channel to receive messages
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
          const payload: Payload = {
            index: index,
            color: activeColor,
          };
          const message: RealtimeMessage = {
            payload: payload,
            session: mySession,
          };
          await channel.send(message);
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

Devvit.addMenuItem({
  label: 'Create a Mini-Place',
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
            Loading place...
          </text>
        </vstack>
      ),
      title: `Mini Place`,
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Successfully created a Place!`,
      appearance: 'success',
    });
  },
});

export default Devvit;
