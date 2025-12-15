import fs from 'node:fs/promises';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const designSystem = require('@reddit/rpl-styles/design-system/system.json');

const OUTPUT = 'src/devvit/internals/semanticColors.ts';

/** @type {(color: string, mappingObj: Record<string, string | object>) => string} */
function getMatchingRPLColor(color, globalColors, themedColors) {
  if (color.startsWith('@')) {
    return themedColors[color.slice(1)];
  }
  return /** @type {string} */ (globalColors[color]);
}

function RPLtoHex(color, globalColors, themedColors, fallbackColors) {
  let finalColor = color;
  const matchingColor = getMatchingRPLColor(finalColor, globalColors, themedColors, fallbackColors);

  // most of the colors in RPL are named, but some are rgba
  if (!matchingColor && color.startsWith('rgba')) {
    return rbgaToHex(color);
  }

  // Some colors reference other RPL colors. If so, match again.
  finalColor = matchingColor.startsWith('#')
    ? matchingColor
    : getMatchingRPLColor(matchingColor, globalColors, themedColors, fallbackColors);

  return finalColor;
}

/** @type {(color: string) => string} */
function rbgaToHex(color) {
  if (color.includes('/')) {
    throw new Error(
      'Cannot convert colors that use / for alpha channels, please use number based rgba values'
    );
  }

  return color
    .replace(/^rgba?\(|\s+|\)$/g, '') // Remove the rgba(  ) from the string
    .split(',') // break out the channels
    .map((channel) => parseFloat(channel)) // convert the channels to numbers
    .map((channel, index) => (index === 3 ? Math.round(channel * 255) : channel)) // convert the alpha channel to a 0-255 value
    .map((channel) => channel.toString(16).padStart(2, '0')) // convert the channels to hex
    .reduce((out, val) => out + val, '#'); // join the channels back together with a # prefix
}

function setOpacity(hex, alpha) {
  return `${hex}${Math.floor(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

async function writeColors() {
  /** @type {(Record<string, string | object>)} */
  const globalColors = designSystem.color.live.global;
  const lightColors = designSystem.color.beta.light;
  const darkColors = designSystem.color.beta.dark;

  const globalNames = Object.keys(globalColors);
  const themedNames = Object.keys(lightColors);

  /** @type {(Record<string, {light: string, dark: string} | string | undefined>)} */
  let RPLColorToHex = {};

  const processColors = (theme, fallback = undefined) => {
    /** @type {(Record<string, string>)} */
    const themedColors = {};
    fallback = fallback ?? theme;

    for (const name of themedNames) {
      let finalColor = /** @type {string} */ '';
      const color = theme[name] ?? fallback[name];

      if (typeof color === 'string' || color instanceof String) {
        /**
         * Highlight is a system color that we use directly.
         * @see https://github.snooguts.net/reddit/reddit-service-shreddit/pull/28604/files/c4b868bd220a34cb961fa4f4b8dd44a5eef148ab#r1550356
         */
        finalColor =
          color.startsWith('#') || color === 'Highlight'
            ? color
            : RPLtoHex(color, globalColors, theme, fallback);
      } else if ('opacity' in color && 'value' in color) {
        const preOpacityColor = color.value.startsWith('#')
          ? color.value
          : RPLtoHex(color.value, globalColors, theme, fallback);
        finalColor = setOpacity(preOpacityColor, color.opacity);
      }
      themedColors[name] = finalColor;
    }

    return themedColors;
  };

  const finalLightColors = processColors(lightColors);
  const finalDarkColors = processColors(darkColors, lightColors);

  globalNames.forEach((name) => (RPLColorToHex[name] = globalColors[name]));
  themedNames.forEach(
    (name) => (RPLColorToHex[name] = { light: finalLightColors[name], dark: finalDarkColors[name] })
  );

  const src = `export const semanticColors = ${JSON.stringify(RPLColorToHex, null, 2)};\n`;
  await fs.writeFile(OUTPUT, src);
}

void writeColors();
