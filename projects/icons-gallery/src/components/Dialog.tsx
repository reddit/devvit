import { Devvit } from '@devvit/public-api';

type DialogProps = {
  children?: JSX.Element | JSX.Element[];
  modal?: boolean;
  onClose: () => void;
  visible: boolean;
  backgroundColor?: string | undefined;
};

export const Dialog = ({
  children,
  modal,
  onClose,
  visible,
  backgroundColor,
}: DialogProps): JSX.Element => {
  return visible ? (
    <zstack
      backgroundColor={modal ? '#00000080' : undefined}
      alignment={'middle center'}
      width={'100%'}
      height={'100%'}
    >
      <zstack>
        <vstack
          border={!modal ? 'thick' : 'none'}
          backgroundColor={backgroundColor || 'white'}
          cornerRadius={'medium'}
          padding={'large'}
        >
          {children}
        </vstack>
        <hstack alignment={'top end'} padding={'medium'} width={'100%'} height={'100%'}>
          <button icon={'close'} onPress={() => onClose()} />
        </hstack>
      </zstack>
    </zstack>
  ) : (
    <></>
  );
};
