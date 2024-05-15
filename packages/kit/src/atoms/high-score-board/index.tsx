import { Devvit } from '@devvit/public-api';

type KeysWithValuesOfType<ObjType, ValueType> = {
  [K in keyof ObjType]-?: ObjType[K] extends ValueType ? K : never;
}[keyof ObjType];

type BoardProps<T> = {
  board: T[];
  nameKey: KeysWithValuesOfType<T, string>;
  scoreKey: KeysWithValuesOfType<T, number>;
};

export function HighScoreBoard<
  T extends Record<KeysWithValuesOfType<T, string>, string> &
    Record<KeysWithValuesOfType<T, number>, number>
>(props: BoardProps<T>): JSX.Element {
  return (
    <hstack alignment="center top">
      <vstack padding="small">
        <text style="heading">Name</text>
        {props.board.map((score) => (
          <text>{score[props.nameKey]}</text>
        ))}
      </vstack>
      <vstack padding="small">
        <text style="heading">Score</text>
        {props.board.map((score) => (
          <text>{score[props.scoreKey]}</text>
        ))}
      </vstack>
    </hstack>
  );
}
