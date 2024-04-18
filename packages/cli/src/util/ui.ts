import chalk from 'chalk';
import os from 'node:os';
import stringLength from 'string-length';

const STYLES = Object.freeze({
  SINGLE: {
    HORIZONTAL: '─',
    SIDE: '│',
    TOP_LEFT: '┌',
    TOP_RIGHT: '┐',
    BOTTOM_LEFT: '└',
    BOTTOM_RIGHT: '┘',
  },
  DOUBLE: {
    HORIZONTAL: '═',
    SIDE: '║',
    TOP_LEFT: '╔',
    TOP_RIGHT: '╗',
    BOTTOM_LEFT: '╚',
    BOTTOM_RIGHT: '╝',
  },
  ROUND: {
    HORIZONTAL: '━',
    SIDE: '┃',
    TOP_LEFT: '┏',
    TOP_RIGHT: '┓',
    BOTTOM_LEFT: '┗',
    BOTTOM_RIGHT: '┛',
  },
  STRONG: {
    HORIZONTAL: '━',
    SIDE: '┃',
    TOP_LEFT: '┏',
    TOP_RIGHT: '┓',
    BOTTOM_LEFT: '┗',
    BOTTOM_RIGHT: '┛',
  },
});

type BoxOptions = {
  padding?: {
    x: number;
    y: number;
  };
  style?: keyof typeof STYLES;
  color?: chalk.Chalk;
};

const defaultBoxOptions: Required<BoxOptions> = {
  padding: { x: 1, y: 0 },
  style: 'SINGLE',
  color: chalk.white,
};
export function logInBox(
  message: string,
  opts: BoxOptions = defaultBoxOptions,
  log: typeof console.log = console.log
): void {
  const padding = opts.padding ?? defaultBoxOptions.padding;
  const style = STYLES[opts.style ?? defaultBoxOptions.style];
  const color = opts.color ?? defaultBoxOptions.color;

  const lines = message.split(os.EOL);
  const maxLength = Math.max(...lines.map((line) => stringLength(line)));

  // no box if text is too long and will be wrapped
  if (process.stdout.columns < maxLength + padding.x * 2 + 2) {
    // add new lines to show separation
    log('\n' + message + '\n');
    return;
  }

  log(color(style.TOP_LEFT + style.HORIZONTAL.repeat(maxLength + padding.x * 2) + style.TOP_RIGHT));
  for (const line of lines) {
    log(
      color(style.SIDE) +
        ' '.repeat(padding.x) +
        line +
        ' '.repeat(getRemainingWidth(maxLength, stringLength(line), padding.x)) +
        color(style.SIDE)
    );
  }
  log(
    color(
      style.BOTTOM_LEFT + style.HORIZONTAL.repeat(maxLength + padding.x * 2) + style.BOTTOM_RIGHT
    )
  );
}

function getRemainingWidth(
  maxLineLength: number,
  currentLineLength: number,
  paddingX: number
): number {
  return maxLineLength - currentLineLength + paddingX;
}
