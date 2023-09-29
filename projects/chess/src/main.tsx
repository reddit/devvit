import { Devvit } from '@devvit/public-api';
import { InteractiveChessBoard } from './components/InteractiveChessBoard.js';
import { Chess, Square, Move } from 'chess.js';
import { Highlight, HighlightType, PieceType, Side, BlankSquare } from './types.js';
import { getRowColFromSquare } from './utilities.js';
import { VariableSpacer } from './components/VariableSpacer.js';

Devvit.debug.emitSnapshots = true;
Devvit.configure({
  redditAPI: true, // context.reddit will now be available
});

/*
 * Use a menu action to create a custom post
 */
Devvit.addMenuItem({
  label: 'New Community Chess Post',
  location: 'subreddit',
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
            Loading Community Chess...
          </text>
        </vstack>
      ),
      title: `Community Chess`,
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Successfully created a Community Chess post!`,
      appearance: 'success',
    });
  },
});

Devvit.addCustomPostType({
  name: 'Community Chess',
  render: ({ useState }) => {
    //'8/8/8/4p1K1/2k1P3/8/8/8 b - - 0 1'
    let [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const chess = new Chess(fen);
    let turn = chess.turn() == Side.white ? Side.white : Side.black;
    console.log(`Turn: ${turn}`);
    let [highlights, setHighlights] = useState(Array<Highlight>);
    let [activeSquare, setActiveSquare] = useState(BlankSquare);
    const [nextMove, setNextMove] = useState(BlankSquare);

    let moveH: Highlight[] = [];

    //TODO: gate behind a confirmation
    if (nextMove != BlankSquare) {
      // Make your move
      try {
        chess.move(nextMove);

        fen = chess.fen();
        setFen(chess.fen());

        //clear state
        setNextMove(BlankSquare);
        highlights = [];
        moveH = [];
        setHighlights([]);
        activeSquare = BlankSquare;
        setActiveSquare(BlankSquare);
        turn = turn == Side.black ? Side.white : Side.black;
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log(`Active Square ${activeSquare}. Highlights: ${JSON.stringify(highlights)}`);

      if (activeSquare && activeSquare != PieceType.BLANK) {
        const moves: Move[] = chess.moves({ square: activeSquare as Square, verbose: true });
        moveH = moves.map((m: Move) => {
          const rc = getRowColFromSquare(m.to);
          const h: Highlight = {
            ...rc,
            type: HighlightType.move,
            san: m.san,
          };
          return h;
        });
      }
    }

    const allH = [...highlights, ...moveH];
    console.log(`Highlights: ${JSON.stringify(allH)}`);
    console.log('loading chessboard');

    return (
      <blocks height="tall">
        <vstack gap="medium" padding="medium" cornerRadius="medium">
          <hstack>
            <vstack gap="none" padding="none" alignment="start top" grow={true}>
              <text size="xlarge" weight="bold">
                White pieces
              </text>
              <text size="small">Available</text>
              <spacer size="medium" />
              <hstack gap="small" alignment="start">
                <hstack
                  cornerRadius="full"
                  border="thick"
                  borderColor="black"
                  backgroundColor="white"
                >
                  <VariableSpacer size="small" count={2} />
                </hstack>
                {turn == Side.white ? (
                  <vstack
                    cornerRadius="full"
                    backgroundColor="black"
                    padding="small"
                    alignment="center middle"
                  >
                    <text color="white" size="small" weight="bold">
                      PLAYING
                    </text>
                  </vstack>
                ) : (
                  <vstack padding="small">
                    <VariableSpacer size="small" count={1} />
                  </vstack>
                )}
              </hstack>
            </vstack>
            <vstack gap="none" padding="none" alignment="end top">
              <text size="xlarge" weight="bold">
                Black pieces
              </text>
              <text size="small">Available</text>
              <spacer size="medium" />
              <hstack gap="small" alignment="end">
                {turn == Side.black ? (
                  <vstack
                    cornerRadius="full"
                    backgroundColor="black"
                    padding="small"
                    alignment="center middle"
                  >
                    <text color="white" size="small" weight="bold">
                      PLAYING
                    </text>
                  </vstack>
                ) : (
                  <vstack padding="small">
                    <VariableSpacer size="small" count={1} />
                  </vstack>
                )}
                <hstack
                  cornerRadius="full"
                  border="thick"
                  borderColor="black"
                  backgroundColor="black"
                >
                  <VariableSpacer size="small" count={2} />
                </hstack>
              </hstack>
            </vstack>
          </hstack>
          <InteractiveChessBoard
            FEN={fen}
            highlights={allH}
            setHighlights={setHighlights}
            turn={turn}
            setActiveSquare={setActiveSquare}
            setNextMove={setNextMove}
          />
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;
