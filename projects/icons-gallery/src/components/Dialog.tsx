import { Devvit } from '@devvit/public-api';
import SpacerSize = Devvit.Blocks.SpacerSize;

type DialogProps = {
  width?: number | undefined;
  height?: number | undefined;
  children?: JSX.Element | JSX.Element[];
  modal?: boolean;
  onClose: () => void;
  visible: boolean;
  backgroundColor?: string | undefined;
};

export const Dialog = ({
  width,
  height,
  children,
  modal,
  onClose,
  visible,
  backgroundColor,
}: DialogProps): JSX.Element => {
  return visible ? (
    <zstack backgroundColor={modal ? '#00000080' : undefined} alignment={'middle center'}>
      <zstack>
        <DialogSizer width={width ?? 300} height={height ?? 400} />
        <vstack
          border={!modal ? 'thick' : 'none'}
          backgroundColor={backgroundColor || 'white'}
          cornerRadius={'medium'}
          padding={'large'}
          grow
        >
          {children}
        </vstack>
        <hstack alignment={'top end'} padding={'medium'}>
          <button icon={'close'} onPress={() => onClose()} />
        </hstack>
      </zstack>
    </zstack>
  ) : (
    <></>
  );
};

type DialogSizerProps = {
  width?: number | undefined;
  height?: number | undefined;
};

function pixelsToSpacers(size: number): JSX.Element[] {
  let remainingSize = size;
  const spacers = [];
  while (remainingSize > 0) {
    let incr = 0;
    let spacerSize: SpacerSize;
    if (remainingSize > 32) {
      incr = 32;
      spacerSize = 'large';
    } else if (remainingSize > 16) {
      incr = 16;
      spacerSize = 'medium';
    } else if (remainingSize > 8) {
      incr = 8;
      spacerSize = 'small';
    } else {
      incr = 4;
      spacerSize = 'xsmall';
    }
    remainingSize -= incr;
    spacers.push(<spacer size={spacerSize} />);
  }
  return spacers;
}

export const DialogSizer = ({ width, height }: DialogSizerProps): JSX.Element => {
  return (
    <>
      <hstack>{pixelsToSpacers(width ?? 0)}</hstack>
      <vstack>{pixelsToSpacers(height ?? 0)}</vstack>
    </>
  );
};
