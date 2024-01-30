import { Devvit } from '@devvit/public-api';

type CheerBarProps = {
  teamACheers: number;
  teamBCheers: number;
  teamAColor: string;
  teamBColor: string;
};

export function CheerBar(props: CheerBarProps): JSX.Element {
  return (
    <hstack width={100} height="44px" cornerRadius="large">
      <hstack
        height={100}
        alignment="middle"
        width={Math.round((props.teamACheers / (props.teamACheers + props.teamBCheers)) * 100)}
        backgroundColor={props.teamAColor}
      >
        <spacer grow />
        <text weight="bold" color={props.teamBColor}>
          {props.teamACheers} fans
        </text>
        <spacer size="small" />
      </hstack>
      <hstack height={100} alignment="middle" grow backgroundColor={props.teamBColor}>
        <spacer size="small" />
        <text weight="bold" color={props.teamAColor}>
          {props.teamBCheers} fans
        </text>
        <spacer grow />
      </hstack>
    </hstack>
  );
}
