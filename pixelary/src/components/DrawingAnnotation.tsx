import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';

interface DrawingAnnotationProps {
  word: string;
  children: JSX.Element;
}

export const DrawingAnnotation = (props: DrawingAnnotationProps): JSX.Element => {
  const { word, children } = props;
  return (
    <vstack gap="small" alignment="center">
      {children}
      <PixelText scale={1}>{word}</PixelText>
    </vstack>
  );
};
