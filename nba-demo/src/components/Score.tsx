import { Devvit } from '@devvit/public-api';

type NbaTeamScore = {
  name: string; // Los Angeles Lakers
  logo: string; // full path to logo, e.g. team-logos/mlb-lakers.png
  score: number; // 2
};

type ScoreProps = {
  teamA: NbaTeamScore;
  teamB: NbaTeamScore;
};

export function Score(props: ScoreProps): JSX.Element {
  return (
    <hstack width={100} height="88px">
      <hstack width={50} alignment="start middle">
        <image
          height={'88px'}
          width={'88px'}
          imageWidth={'128px'}
          imageHeight={'128px'}
          url={props.teamA.logo}
          resizeMode="fill"
        />
        <spacer size="small" />
        <vstack alignment="middle start">
          <text color="#f3f4f5" size="xxlarge" height="48px">
            {props.teamA.score}
          </text>
          <text color="#f3f4f5" size="xlarge">
            {props.teamA.name.toUpperCase()}
          </text>
        </vstack>
      </hstack>
      <hstack width={50} alignment="end middle">
        <vstack alignment="middle end">
          <text color="#f3f4f5" size="xxlarge" height="48px">
            {props.teamB.score}
          </text>
          <text color="#f3f4f5" size="xlarge">
            {props.teamB.name.toUpperCase()}
          </text>
        </vstack>
        <spacer size="small" />
        <image
          height={'88px'}
          width={'88px'}
          imageWidth={'128px'}
          imageHeight={'128px'}
          url={props.teamB.logo}
          resizeMode="fill"
        />
      </hstack>
    </hstack>
  );
}
