import { Devvit, StateSetter } from '@devvit/public-api';
import { PieceType, Highlight, Side } from '../types.js';
import { InteractiveChessSquare } from './InteractiveChessSquare.js';

type ChessBoardProps = {
  FEN: string;
  turn: Side;
  highlights: Highlight[];
  setHighlights: StateSetter<Highlight[]>;
  setActiveSquare: StateSetter<string>;
  setNextMove: StateSetter<string>;
};

export const InteractiveChessBoard: Devvit.BlockComponent<ChessBoardProps> = ({
  FEN,
  turn,
  highlights,
  setHighlights,
  setActiveSquare,
  setNextMove,
}: ChessBoardProps) => {
  console.log('parsing FEN');
  const rows = parseFEN({
    FEN,
    turn,
    highlights,
    setHighlights,
    setActiveSquare,
    setNextMove,
  });

  console.log('Returning board');
  return (
    <vstack padding="large" alignment="center middle">
      {rows.map((row) => {
        return <hstack>{row}</hstack>;
      })}
      ;
    </vstack>
  );
};

function parseFEN({
  FEN,
  turn,
  highlights,
  setHighlights,
  setActiveSquare,
  setNextMove,
}: ChessBoardProps): JSX.Element[][] {
  const positions = FEN.split(' ')[0]; // first element in string is positions

  const rows: JSX.Element[][] = [];
  let curRow: JSX.Element[] = [];
  let row = 0,
    column = 0;

  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    const pInt = Number(p);
    if (Number(pInt)) {
      // Blank space indicator
      curRow = curRow.concat(
        Array.from(Array(Number(pInt)), (_, index) => {
          return (
            <InteractiveChessSquare
              row={row}
              column={column + index}
              piece={PieceType.BLANK}
              turn={turn}
              highlights={highlights}
              setHighlights={setHighlights}
              setActiveSquare={setActiveSquare}
              setNextMove={setNextMove}
            />
          );
        })
      );
      column += pInt;
    } else if (p === '/') {
      // New row
      rows.push(curRow);
      row++;
      column = 0;
      curRow = [];
    } else {
      // Piece
      curRow.push(
        <InteractiveChessSquare
          row={row}
          column={column}
          piece={p}
          turn={turn}
          highlights={highlights}
          setHighlights={setHighlights}
          setActiveSquare={setActiveSquare}
          setNextMove={setNextMove}
        />
      );
      column++;
    }
  }

  // Get the last row
  rows.push(curRow);

  return rows;
}
