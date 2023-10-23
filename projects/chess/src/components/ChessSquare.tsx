import { Devvit } from '@devvit/public-api';
import { BoardColors, PieceType } from '../types.js';

type ChessSquareProps = {
  row: number;
  column: number;
  piece: string;
};

export const ChessSquare: Devvit.BlockComponent<ChessSquareProps> = (
  { row, column, piece },
  context: Devvit.Context
) => {
  const [isSelected, setIsSelected] = context.useState(false);
  const squareColor = (row + column) % 2 === 0 ? BoardColors.light : BoardColors.dark;
  return (
    <zstack
      alignment="center middle"
      backgroundColor={squareColor}
      border="thick"
      borderColor={isSelected ? squareColor : BoardColors.selected}
      onPress={() => setIsSelected(true)}
    >
      <image url={pieceToImage(piece)} imageWidth={38} imageHeight={38} resizeMode="fit" />
    </zstack>
  );
};

function pieceToImage(piece: string): string {
  if (piece === PieceType.BLANK) {
    return 'blank.png';
  } else if ('PBNQKR'.includes(piece)) {
    return `w${piece}.png`;
  } else {
    return `${piece}.png`;
  }
}
