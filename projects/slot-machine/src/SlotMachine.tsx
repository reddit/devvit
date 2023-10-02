import { Devvit, Context } from '@devvit/public-api';
import Reel from './Reel.js';
import { initialCopy, winCopy } from './copy.js';

// 10 symbols gives us 10 * 10 * 10 = 1000 possible row combinations
export const symbols = [
  { image: 'moosey.png', muliplier: 5 },
  { image: 'fridge.png', muliplier: 20 },
  { image: 'gift.png', muliplier: 100 },
];

/*
export const symbols = [
  { image: "moosey.png", muliplier: 5 },
  { image: "fridge.png", muliplier: 20 },
  { image: "gift.png", muliplier: 100 },
  { image: "foamFinger.png", muliplier: 10 },
  { image: "respect.png", muliplier: 25 },
  { image: "bananas.png", muliplier: 15 },
  { image: "plusOne.png", muliplier: 50 },
  { image: "horsehead.png", muliplier: 1000 },
  { image: "star.png", muliplier: 2000 },
  { image: "mystery.png", muliplier: 5 },
];
*/

const increments = [1, 5, 10, 100, 1000, 10000];

function createRow(imagesPerLine: number = 3) {
  return Array.from({ length: imagesPerLine }, () => {
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    return randomSymbol.image;
  });
}
function createReel(lines: number = 16) {
  return Array.from({ length: lines }, () => createRow());
}

function compareStrings(strings: string[]): boolean {
  if (strings.length === 0) return false;
  const referenceString = strings[0];
  return strings.every((str) => str === referenceString);
}

export function getRandomString(list: string[]): string {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

export default function (context: Context) {
  const { useState } = context;
  const [spinning, setSpinning] = useState(false);
  const [reelData, setReelData] = useState(createReel());
  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState(100);
  const [confetti, setConfetti] = useState(false);
  const [title, setTitle] = useState(getRandomString(initialCopy));

  function endSpin(lastRows: any) {
    const centerLine = lastRows[2];
    console.log(centerLine);

    const allEqual = compareStrings(centerLine);

    if (allEqual) {
      const multiplier = symbols.find((symbol) => symbol.image === centerLine[0])?.muliplier;
      if (!multiplier) return;
      setTitle(getRandomString(winCopy));
      setBalance((c) => c + bet * multiplier);
      setConfetti(true);
    } else {
      setTitle(getRandomString(initialCopy));
    }

    setSpinning(false);
    const newReelData = [...lastRows, ...createReel()];
    setReelData(newReelData);
  }

  // Flags for conditional rendering
  const betIndex = increments.indexOf(bet);
  const nextIndex = betIndex + 1;
  const prevIndex = betIndex - 1;
  const nextBet = nextIndex < increments.length ? increments[nextIndex] : null;
  const prevBet = prevIndex >= 0 ? increments[prevIndex] : null;
  const canIncrement = nextBet !== null && !spinning && balance >= nextBet;
  const canDecrement = prevBet !== null && !spinning && balance >= prevBet;
  const canSpin = !spinning && balance >= bet;

  return (
    <blocks height="tall">
      <zstack
        cornerRadius="medium"
        border="thin"
        gap="medium"
        height={100}
        backgroundColor="#FF4500"
      >
        {/* Reel with symbols */}
        <Reel data={reelData} spin={spinning} context={context} onEnd={endSpin} />

        {/* Graphical overlay */}
        <vstack>
          <image
            url="gradient.png"
            imageHeight={512}
            imageWidth={512}
            height={100}
            width={100}
            resizeMode="cover"
          />
        </vstack>

        {/* Confetti for win state */}
        {confetti && (
          <vstack>
            <image
              url="confetti.gif"
              imageHeight={800}
              imageWidth={800}
              height={100}
              width={100}
              resizeMode="fill"
            />
          </vstack>
        )}

        {/* To disable user selections on the below layers */}
        <vstack backgroundColor="transparent" />

        {/* Footer */}
        <vstack alignment="bottom">
          <zstack
            alignment="middle center"
            backgroundColor="transparent"
            height={(101 / 512) * 100}
          >
            <hstack gap="medium" alignment="middle center">
              {/* Decrement button */}
              <vstack
                padding="small"
                border="thick"
                borderColor={canDecrement ? 'white' : 'rgba(255, 255, 255, 0.3)'}
                cornerRadius="full"
                alignment="middle center"
                onPress={() => {
                  if (!canDecrement) return;
                  const index = increments.indexOf(bet);
                  const prevIndex = index - 1;
                  const prevBet = increments[Math.max(prevIndex, 0)];
                  setBet(prevBet);
                }}
              >
                <icon
                  name="subtract-fill"
                  size="large"
                  color={canDecrement ? 'white' : 'rgba(255, 255, 255, 0.3)'}
                />
              </vstack>

              {/* Spin button */}
              <hstack
                padding="medium"
                backgroundColor={canSpin ? 'white' : 'rgba(255, 255, 255, 0.3)'}
                cornerRadius="full"
                alignment="middle center"
                onPress={() => {
                  if (!canSpin) return;
                  console.log('pressed');
                  setSpinning(true);
                  setBalance((c) => c - bet);
                  if (!confetti) return;
                  setConfetti(false);
                  setTitle(getRandomString(initialCopy));
                }}
              >
                <spacer size="medium" />
                <text size="large" weight="bold" color="#FF4500" selectable={false}>
                  Spin for
                </text>
                <spacer size="small" />
                <icon name="star-fill" size="small" color="#FF4500" />
                <spacer size="xsmall" />
                <text size="large" weight="bold" color="#FF4500" selectable={false}>
                  {bet}
                </text>
                <spacer size="medium" />
              </hstack>

              {/* Increment button */}
              <vstack
                padding="small"
                border="thick"
                borderColor={canIncrement ? 'white' : 'rgba(255, 255, 255, 0.3)'}
                cornerRadius="full"
                alignment="middle center"
                onPress={() => {
                  if (!canIncrement) return;
                  const index = increments.indexOf(bet);
                  const nextIndex = index + 1;
                  const nextBet = increments[Math.min(nextIndex, increments.length - 1)];
                  setBet(nextBet);
                }}
              >
                <icon
                  name="add-fill"
                  size="large"
                  color={canIncrement ? 'white' : 'rgba(255, 255, 255, 0.3)'}
                />
              </vstack>
            </hstack>
          </zstack>
        </vstack>

        {/* Header */}
        <vstack alignment="top">
          <zstack
            alignment="middle center"
            backgroundColor="transparent"
            height={(101 / 512) * 100}
          >
            <vstack gap="small" alignment="center">
              <text size="xxlarge" weight="bold" color="white" selectable={false}>
                {title}
              </text>
              <hstack gap="small" alignment="middle">
                <icon name="star-fill" size="small" color="white" />
                <text size="large" color="white" selectable={false}>
                  {`${balance} balance`}
                </text>
              </hstack>
            </vstack>
          </zstack>
        </vstack>
      </zstack>
    </blocks>
  );
}
