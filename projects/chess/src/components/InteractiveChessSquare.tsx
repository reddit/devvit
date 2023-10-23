import { Devvit, StateSetter } from '@devvit/public-api';
import { VariableSpacer } from './VariableSpacer.js';
import { BoardColors, PieceType, Highlight, HighlightType, Side, BlankSquare } from '../types.js';
import { getSquare, pieceToImage, isMyPiece } from '../utilities.js';
import { Square } from 'chess.js';

type ChessSquareProps = {
  row: number;
  column: number;
  piece: string;
  turn: Side;
  highlights: Highlight[];
  setHighlights: StateSetter<Highlight[]>;
  setActiveSquare: StateSetter<string>;
  setNextMove: StateSetter<string>;
};

export const InteractiveChessSquare: Devvit.BlockComponent<ChessSquareProps> = (
  {
    row,
    column,
    piece,
    turn,
    highlights,
    setHighlights,
    setActiveSquare,
    setNextMove,
  }: ChessSquareProps,
  _context: Devvit.Context
) => {
  const isSelected = highlights.find((h: Highlight) => {
    return h.row === row && h.column === column && h.type === HighlightType.selected;
  });
  const squareColor = (row + column) % 2 === 0 ? BoardColors.light : BoardColors.dark;
  const isMine = isMyPiece(turn, piece);
  const isMove = highlights.find((h: Highlight) => {
    return h.row === row && h.column === column && h.type === HighlightType.move;
  });

  // console.log(`row/col: ${row}, ${column}, isMine: ${isMine}, isSelected: ${isSelected}, isMove: ${isMove}`);

  return (
    <zstack
      alignment="center middle"
      backgroundColor={squareColor}
      border="thick"
      borderColor={isSelected ? BoardColors.selected : squareColor}
      onPress={() => {
        if (!(isMine || isMove || piece !== PieceType.BLANK)) return; // do nothing if this isn't a moveable piece
        console.log(`isMove: ${isMove} for ${row} ${column}`);
        if (isMove) {
          setNextMove(isMove.san as string);
        } else if (isSelected) {
          // de-select and remove highlights
          setHighlights([]);
          setActiveSquare(BlankSquare);
        } else {
          //select this square
          setHighlights([{ row: row, column: column, type: HighlightType.selected }]);
          setActiveSquare(getSquare(row, column) as Square);
        }
      }}
    >
      <image url={pieceToImage(piece)} imageWidth={38} imageHeight={38} resizeMode="fit" />
      {isMove ? (
        <vstack cornerRadius="full" backgroundColor={BoardColors.move}>
          <VariableSpacer size="small" />
        </vstack>
      ) : (
        <></>
      )}
    </zstack>
  );
};
