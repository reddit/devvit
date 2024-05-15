import { Devvit } from '@devvit/public-api';

export const ToastContainer = (props: {
  children: JSX.Children | JSX.Element;
  text: string | null;
  onClose: () => void;
}): JSX.Element => {
  return (
    <zstack height={100} width={100}>
      {props.children}
      {props.text !== null ? (
        <vstack width={100} height={100} alignment="center bottom" backgroundColor="#00000077">
          <hstack
            cornerRadius="medium"
            backgroundColor="white"
            padding="small"
            alignment="center middle"
            width={90}
            maxWidth="400px"
          >
            <spacer size="small" />
            <text wrap maxWidth="80%">
              {props.text}
            </text>
            <spacer size="small" grow />
            <button icon="close-fill" size="small" onPress={props.onClose} />
          </hstack>
          <spacer size="large"></spacer>
        </vstack>
      ) : null}
    </zstack>
  );
};
