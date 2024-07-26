export enum Op {
  CLEAR = 'C',
  DIVIDE = 'DIV',
  MULTIPLY = 'MULT',
  SUBTRACT = 'SUB',
  ADD = 'ADD',
  EQUALS = 'EQ',
  DECIMAL = 'DEC',
}

export type OnKeyPress = (key: Op | number) => void;

export type KeyValue = Op | number;

export const keyValueLabel = (value: KeyValue): string => {
  switch (value) {
    case Op.CLEAR:
      return 'C';
    case Op.DIVIDE:
      return '÷';
    case Op.MULTIPLY:
      return '×';
    case Op.SUBTRACT:
      return '-';
    case Op.ADD:
      return '+';
    case Op.EQUALS:
      return '=';
    case Op.DECIMAL:
      return '.';
    default:
      return value.toString();
  }
};
