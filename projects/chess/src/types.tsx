export enum PieceType {
  BLANK = ' ',
}
export const BlankSquare = '';

export enum BoardColors {
  light = '#F2E1C3',
  // light = "#F2F4F5",
  dark = '#C3A082',
  // dark = "#E2E7E9",
  selected = 'black',
  // move = "rgba(24,112,244,.3)"
  move = 'yellow',
}

export enum HighlightType {
  selected,
  move,
}

export type Highlight = {
  row: number;
  column: number;
  type: HighlightType;
  san?: string;
};

export enum Side {
  black = 'b',
  white = 'w',
}

export enum PieceStrings {
  white = 'PBNQKR',
  black = 'prbqkn',
}
