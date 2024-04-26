import { sanitizeSvg } from '@devvit/shared-types/sanitizeSvg.js';

/**
 * @experimental
 *
 * A helper to allow SVG functionality within image tags.
 *
 * @example
 * ```ts
 * import { Devvit, svg } from '@devvit/public-api';
 * const App = () => {
 *     const color = 'gold'
 *     return (
 *        <hstack>
 *          <image
 *            url={svg`<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
 *                      <circle fill="${color}" cx="5" cy="5" r="4" />
 *                    </svg>`}
 *            imageHeight={100}
 *            imageWidth={100}
 *          />
 *        </hstack>
 *     )
 * }
 * ```
 */
export function svg(
  strings: TemplateStringsArray,
  ...args: (string | number)[]
): `data:image/svg+xml;charset=UTF-8,${string}` | '' {
  let str = '';

  // Assemble the SVG string
  strings.forEach((string, index) => {
    str += string;
    const arg = args[index];

    if (arg !== undefined) {
      // Cast number to string
      str += `${arg}`;
    }
  });

  // Sanitize the SVG string
  str = sanitizeSvg(str);

  if (str === undefined) {
    return '';
  }

  // Return the sanitized SVG string as a data URI
  // This fixes things like hexadecimal colors that URLs treat as special characters!
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(str)}`;
}
