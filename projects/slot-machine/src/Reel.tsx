import { Devvit, Context } from '@devvit/public-api';

const framerate = 25;
const stepSize = 15;
const headerHeight = 109;
const initialOffset = 85;

type RowProps = {
  images: string[];
  size: number;
};

function Row({ images, size }: RowProps) {
  return (
    <hstack gap="small">
      {images.map((image) => (
        <image url={image} imageHeight={size} imageWidth={size} />
      ))}
    </hstack>
  );
}

type ReelProps = {
  data: string[][];
  spin: boolean;
  context: Context;
  onEnd: (lastRows: string[][]) => void;
};

export default function ({ data, spin, context, onEnd }: ReelProps) {
  const { useState, useInterval } = context;
  const [counter, setCounter] = useState(initialOffset);
  const [startLine, setStartLine] = useState(0);
  const currentRows = data.slice(startLine, startLine + 4);
  const rowElements = currentRows.map((line) => <Row images={line} size={headerHeight} />);

  function tick() {
    if (!spin) return;
    const maxVisibleRows = 4;

    if (data.length - startLine > maxVisibleRows) {
      setCounter(counter + stepSize);
      if (counter > headerHeight) {
        setCounter(0);
        setStartLine((current) => current + 1);
      }
    } else if (counter < initialOffset) {
      setCounter(counter + stepSize);
    } else {
      setStartLine(0);
      onEnd(currentRows);
    }
  }

  const loop = useInterval(tick, 1000 / framerate);
  loop.start();

  return (
    <vstack alignment="top center" width={100} height={200}>
      <hstack height={(counter / 1024) * 100} />
      <vstack gap="small" reverse>
        {rowElements}
      </vstack>
    </vstack>
  );
}
