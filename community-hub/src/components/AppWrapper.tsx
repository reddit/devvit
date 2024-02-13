import { Devvit } from '@devvit/public-api';

type BorderComponentProps = {
  showBorder: boolean;
  children: any;
  borderColor: { light: string; dark: string | null };
};

const BorderComponent = ({ showBorder, borderColor, children }: BorderComponentProps) => {
  if (showBorder === false) return children;

  return (
    <vstack
      padding="medium"
      gap="medium"
      alignment="top center"
      cornerRadius="medium"
      width={100}
      backgroundColor={borderColor.light}
      height={100}
    >
      {children}
    </vstack>
  );
};

type AppWrapperProps = BorderComponentProps;

export const AppWrapper = ({ showBorder, borderColor, children }: AppWrapperProps) => {
  return (
    <BorderComponent showBorder={showBorder} borderColor={borderColor}>
      <vstack
        lightBackgroundColor="#FFFFFF"
        darkBackgroundColor="#1A1A1B"
        alignment="top"
        width={100}
        height={100}
        cornerRadius="medium"
      >
        {children}
      </vstack>
    </BorderComponent>
  );
};
