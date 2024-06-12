import { Devvit } from '@devvit/public-api';
import { getShortFormattedDateString } from '../../utils/Time.js';
import type { ThreadInfo } from '../../PostManager.js';

export type TitleComponentProps = {
  postInfo: ThreadInfo;
  showDate: boolean;
};

export const TitleComponent: Devvit.BlockComponent<TitleComponentProps> = ({
  postInfo,
  showDate,
}) => {
  const formattedDate = getShortFormattedDateString(postInfo.date, postInfo.timezone);
  return (
    <hstack
      width={'100%'}
      backgroundColor="Mintgreen-200"
      padding="small"
      alignment="center middle"
      grow
    >
      <spacer size="xsmall" />
      <text color="black" style="heading" size="xxlarge" alignment="start middle">
        {postInfo.header ?? postInfo.title}
      </text>
      <spacer grow />
      {showDate ? (
        <text color="black" style="metadata" size="xlarge" alignment="end middle">
          {formattedDate}
        </text>
      ) : null}
      <spacer size="xsmall" />
    </hstack>
  );
};
