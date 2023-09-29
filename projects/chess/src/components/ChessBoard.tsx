import { Devvit } from '@devvit/public-api';
import { PieceType } from '../types.js';
import { ChessSquare } from './ChessSquare.js';

type ChessBoardProps = {
  FEN: string;
};

export const ChessBoard: Devvit.BlockComponent<ChessBoardProps> = ({ FEN }: ChessBoardProps) => {
  const rows = parseFEN(FEN); // First section of FEN is all we need for position

  return (
    <vstack padding="large" alignment="center middle">
      {rows.map((row) => {
        return <hstack>{row}</hstack>;
      })}
      ;
    </vstack>
  );
};

function parseFEN(FEN: string): JSX.Element[][] {
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
          return <ChessSquare row={row} column={column + index} piece={PieceType.BLANK} />;
        })
      );
      column += pInt;
    } else if (p === '/') {
      // New row
      rows.push(curRow);
      row++;
      column = 0;
      curRow = [];
      console.log('new row');
    } else {
      // Piece
      console.log(`${p}, ${row}, ${column}`);
      curRow.push(<ChessSquare row={row} column={column} piece={p} />);
      column++;
    }
  }

  // Get the last row
  rows.push(curRow);

  return rows;
}
