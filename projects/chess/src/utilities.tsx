import { PieceStrings, PieceType, Side } from './types.js';

const cols = 'abcdefgh';
const rows = '87654321';

export function getRowColFromSquare(lan: string) {
  const olan = lan;
  if (lan.length === 3) {
    lan = lan.substring(1);
  }
  const r = rows.indexOf(lan[1]);
  if (r === -1) {
    console.log(`***** Row is -1. ${olan}`);
  }
  return { row: r, column: cols.indexOf(lan[0]) };
}

export function getSquare(row: number, column: number) {
  return `${cols[column]}${rows[row]}`;
}

export function pieceToImage(piece: string): string {
  if (piece === PieceType.BLANK) {
    return 'blank.png';
  } else if (PieceStrings.white.includes(piece)) {
    return `w${piece}.png`;
  } else {
    return `${piece}.png`;
  }
}

export function isMyPiece(turn: Side, piece: string) {
  return (
    (turn === Side.white && PieceStrings.white.includes(piece)) ||
    (turn === Side.black && PieceStrings.black.includes(piece))
  );
}
