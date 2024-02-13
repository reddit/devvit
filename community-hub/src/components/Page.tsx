import { Devvit } from '@devvit/public-api';
import { PageProps } from '../types/page.js';

export type PageContentProps = Pick<PageProps, 'navigate'> & {
  children: JSX.Element;
  showHomeButton?: boolean;
};

export const Page: {
  ({ children }: { children: JSX.Element }): JSX.Element;
  Content: (props: PageContentProps) => JSX.Element;
  ContentHeader: ({ children }: { children: string }) => JSX.Element;
  ContentSubHeader: ({ children }: { children: string }) => JSX.Element;
  Nav: (props: {
    buttonStart?: {
      buttonStartProps: Devvit.Blocks.ButtonProps;
      buttonStartText?: string;
    };
    buttonMiddle?: {
      buttonMiddleProps: Devvit.Blocks.ButtonProps;
      buttonMiddleText?: string;
    };
    buttonEnd?: {
      buttonEndProps: Devvit.Blocks.ButtonProps;
      buttonEndText?: string;
    };
    bottomBorderColor?: {
      light: string;
      dark: string | null;
    };
  }) => JSX.Element;
} = ({ children }) => {
  return (
    <vstack width={100} height={100} lightBackgroundColor="#FFFFFF" darkBackgroundColor="#1A1A1B">
      {children}
    </vstack>
  );
};

Page.Content = ({ children, navigate, showHomeButton = true }) => {
  return (
    <zstack width={100} height={100} padding="small">
      <vstack width={100} lightBackgroundColor="#FFFFFF" darkBackgroundColor="#1A1A1B">
        {children}
      </vstack>

      {showHomeButton && (
        <hstack alignment="top end" width={100}>
          <button
            size="small"
            icon={'home'}
            onPress={() => navigate('home')}
            appearance="primary"
          />
        </hstack>
      )}
    </zstack>
  );
};

Page.Nav = ({ buttonStart, buttonMiddle, buttonEnd, bottomBorderColor }) => {
  let sButton = <hstack grow></hstack>;
  if (buttonStart?.buttonStartProps.onPress) {
    sButton = (
      <hstack alignment="start" grow>
        <button
          size="small"
          icon={buttonStart.buttonStartProps?.icon}
          onPress={buttonStart.buttonStartProps?.onPress}
          appearance="primary"
        >
          {buttonStart.buttonStartText}
        </button>
      </hstack>
    );
  }

  let mButton = <hstack grow></hstack>;
  if (buttonMiddle?.buttonMiddleProps.onPress) {
    mButton = (
      <hstack alignment="center" grow>
        mButton = (
        <button
          size="small"
          icon={buttonMiddle.buttonMiddleProps?.icon}
          onPress={buttonMiddle.buttonMiddleProps?.onPress}
          appearance="primary"
        >
          {buttonMiddle.buttonMiddleText}
        </button>
        );
      </hstack>
    );
  }

  let eButton = <hstack grow></hstack>;
  if (buttonEnd?.buttonEndProps.onPress) {
    eButton = (
      <hstack grow alignment="end">
        <button
          size="small"
          icon={buttonEnd.buttonEndProps?.icon}
          onPress={buttonEnd.buttonEndProps?.onPress}
          appearance="primary"
        >
          {buttonEnd.buttonEndText}
        </button>
      </hstack>
    );
  }

  return (
    <>
      <hstack
        padding="xsmall"
        gap="small"
        lightBackgroundColor="#FFFFFF"
        darkBackgroundColor="#1A1A1B"
      >
        {sButton}
        {mButton}
        {eButton}
      </hstack>
      <hstack width="100%" backgroundColor={bottomBorderColor?.light} height="3px" />
    </>
  );
};

Page.ContentHeader = ({ children }) => {
  return (
    <hstack alignment="center">
      <text color="black white" size="xxlarge">
        {children}
      </text>
    </hstack>
  );
};

Page.ContentSubHeader = ({ children }) => {
  return (
    <vstack alignment="center">
      <vstack alignment="center" width={'60%'}>
        <text color="black white" size="small" weight="bold" alignment="center" width={'100%'} wrap>
          {children}
        </text>
      </vstack>
    </vstack>
  );
};
