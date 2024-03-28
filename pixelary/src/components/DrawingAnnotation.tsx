import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';

interface DrawingAnnotationProps {
  word: string;
  children: JSX.Element;
}

export const DrawingAnnotation = (props: DrawingAnnotationProps): JSX.Element => {
  const { word, children } = props;
  return (
    <vstack gap="small" alignment="start">
      {children}
      <PixelText scale={1.5}>{`${word.slice(0, 6)}${word.length > 6 ? '.' : ''}`}</PixelText>
    </vstack>
  );
};
