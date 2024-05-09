import { Devvit } from '@devvit/public-api';
import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';
import { StackPaddingGapConfiguration } from './StackPaddingGapCategory.js';

export enum StackSizingPreviewType {
  pixel,
  percent,
  intrinsic
}

type Preview = {
  label: string;
  sizingTypes: StackSizingPreviewType[];
}

const previews: readonly Preview[] = [
  {
    label: 'Pixel',
    sizingTypes: [StackSizingPreviewType.pixel, StackSizingPreviewType.pixel],
  },
  {
    label: 'Percent',
    sizingTypes: [StackSizingPreviewType.percent, StackSizingPreviewType.percent],
  },
  {
    label: 'Intrinsic',
    sizingTypes: [StackSizingPreviewType.intrinsic, StackSizingPreviewType.intrinsic],
  },
  {
    label: 'Pixel + Percent',
    sizingTypes: [StackSizingPreviewType.percent, StackSizingPreviewType.pixel],
  },
  {
    label: 'Percent + Intrinsic',
    sizingTypes: [StackSizingPreviewType.percent, StackSizingPreviewType.intrinsic],
  },
  {
    label: 'Pixel + Intrinsic',
    sizingTypes: [StackSizingPreviewType.pixel, StackSizingPreviewType.intrinsic],
  },
  {
    label: 'All',
    sizingTypes: [StackSizingPreviewType.pixel, StackSizingPreviewType.percent, StackSizingPreviewType.intrinsic],
  },
];

export const StackPaddingGapPreview = ({ mode, configuration }: { mode: string, configuration: number }): JSX.Element => {

  const gap: Devvit.Blocks.ContainerGap = (configuration & StackPaddingGapConfiguration.Gap) === StackPaddingGapConfiguration.Gap ? 'small' : 'none';
  const reverse = (configuration & StackPaddingGapConfiguration.Reverse) === StackPaddingGapConfiguration.Reverse;
  const constrain = (configuration & StackPaddingGapConfiguration.Constrain) === StackPaddingGapConfiguration.Constrain;
  const grow = (configuration & StackPaddingGapConfiguration.Grow) === StackPaddingGapConfiguration.Grow;

  const content = previews.map(({ label, sizingTypes }) => {
    const items = sizingTypes.map((sizeType, index) => {
      const color = index % 2 === 0 ? 'blue' : 'green';
      return (
        <Item color={color} sizeType={sizeType} shouldGrow={grow} axis={mode} />
      )
    });

    return (
      <Tile label={label} padding="small">
        {mode === 'h' ? (
          constrain ? (
            <hstack borderColor='darkgrey' gap={gap} reverse={reverse} width={'80px'} height={'40px'} padding='xsmall'>
              {items}
            </hstack>
          ) : (
            <hstack borderColor='darkgrey' gap={gap} reverse={reverse} padding='xsmall'>
              {items}
            </hstack>
          )
        ) : mode === 'v' ? (
          constrain ? (
            <vstack borderColor='darkgrey' gap={gap} reverse={reverse} width={'40px'} height={'80px'} padding='xsmall'>
              {items}
            </vstack>
          ) : (
            <vstack borderColor='darkgrey' gap={gap} reverse={reverse} padding='xsmall'>
              {items}
            </vstack>
          )
        ) : (
          constrain ? (
            <zstack borderColor='darkgrey' gap={gap} reverse={reverse} width={'80px'} height={'80px'} padding='xsmall'>
              {items}
            </zstack>
          ) : (
            <zstack borderColor='darkgrey' gap={gap} reverse={reverse} padding='xsmall'>
              {items}
            </zstack>
          )
        )}
      </Tile>
    )
  });

  return (
    <vstack grow>
      <Columns count={3}>{content}</Columns>
    </vstack>
  );
};

type ItemProps = {
  color: string;
  sizeType: StackSizingPreviewType;
  shouldGrow: boolean;
  axis: string;
};

const Item = (props: ItemProps): JSX.Element => {
  const { color, sizeType, shouldGrow, axis } = props;
  switch (sizeType) {
    case StackSizingPreviewType.pixel:
      return (
        <hstack
          backgroundColor={color}
          cornerRadius='small'
          width={'20px'}
          height={'20px'}
          grow={shouldGrow}
        ></hstack>
      );
    case StackSizingPreviewType.percent:
      return (
        <hstack
          backgroundColor={color}
          cornerRadius='small'
          width={axis === 'v' ? '100%' :'50%'}
          height={axis === 'h' ? '100%' : '50%'}
          grow={shouldGrow}
        ></hstack>
      );
    case StackSizingPreviewType.intrinsic:
      return (
        <hstack
          backgroundColor={color}
          cornerRadius='small'
          grow={shouldGrow}
        >
          <text>Do it!</text>
        </hstack>
      );
  }
};
