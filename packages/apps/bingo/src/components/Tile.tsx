import { Devvit } from '@devvit/public-api';
import type { ThemeConfig } from '../types.js';

type TileProps = {
  text: string;
  active: boolean;
  isEasyEyeMode: boolean;
  onPress: () => void | Promise<void>;
  themeConfig: ThemeConfig;
};

export const wrapText = (
  text: string,
  maxLineLength: number = 14,
  maxRows: number = 4
): string[] => {
  // Split the text into words, treating hyphenated words as single units.
  const words = text.split(/\s+/);
  let currentLine = '';
  const lines: string[] = [];

  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    // Truncate the word if it's longer than the max line length and append '...'.
    if (word.length > maxLineLength) {
      word = word.substring(0, maxLineLength - 3) + '...';
    }

    // Check if adding the next word would exceed the max line length.
    if (currentLine.length + word.length + (currentLine ? 1 : 0) > maxLineLength) {
      // If the current line isn't empty and adding another word would exceed the limit, start a new line.
      lines.push(currentLine);
      currentLine = word;
    } else {
      // Append the word to the current line (with a space if the line isn't empty).
      currentLine += (currentLine ? ' ' : '') + word;
    }

    // If we've reached the maximum rows, we need to check if it's time to stop adding words.
    if (lines.length === maxRows - 1) {
      if (i < words.length - 1 || currentLine.length + (currentLine ? 1 : 0) > maxLineLength) {
        // If there are more words left or the current line is full, trim and add '...'.
        currentLine = currentLine.substring(0, maxLineLength - 3) + '...';
        lines.push(currentLine);
        break;
      }
    }
  }

  // If we haven't reached the maxRows, add the current line.
  if (lines.length < maxRows && currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

export const Tile = (props: TileProps): JSX.Element => {
  const { text, active, themeConfig, onPress } = props;
  const chunkedText = wrapText(text, props.isEasyEyeMode ? 11 : 12, props.isEasyEyeMode ? 3 : 4);

  return (
    <hstack
      backgroundColor={active ? themeConfig.tileBgActive : themeConfig.tileBg} //selected : unselected
      height="66px"
      width="79px"
      alignment="center middle"
      onPress={onPress}
      border="thin"
      borderColor={active ? themeConfig.tileBorderActive : themeConfig.tileBorder}
    >
      <vstack grow width={100} height={100} alignment="center middle">
        {chunkedText.map((row) => (
          <text
            selectable={false}
            color={active ? themeConfig.tileTextActive : themeConfig.tileText}
            weight="bold"
            size={props.isEasyEyeMode ? 'small' : 'xsmall'}
          >
            {row}
          </text>
        ))}
        {/* <text
          selectable={false}
          color={active ? 'white' : 'black'}
          size={props.isEasyEyeMode ? 'medium' : 'xsmall'}
          weight="bold"
          wrap={true}
          height={100}
        >
          {displayText}
        </text> */}
      </vstack>
    </hstack>
  );
};
