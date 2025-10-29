// https://github.com/cure53/DOMPurify/blob/f89d72681513d749d303798ced02fa2799340989/src/tags.js#L202
const DISALLOWED_ELEMENTS = [
  // We don't allow images bypass reddit safety checks!
  /**
   * 1/31/24: We need to allow images so we can make things happen.
   * https://reddit.atlassian.net/browse/DX-5740
   */
  // 'image',
  'animate',
  'color-profile',
  'cursor',
  'discard',
  'font-face',
  'font-face-format',
  'font-face-name',
  'font-face-src',
  'font-face-uri',
  'foreignobject',
  'hatch',
  'hatchpath',
  'mesh',
  'meshgradient',
  'meshpatch',
  'meshrow',
  'missing-glyph',
  'script',
  'set',
  'solidcolor',
  'unknown',
  'use',
];

// We don't allow images bypass reddit safety checks!
const DISALLOWED_STYLES = [
  /**
   * 1/31/24: We need to allow images so we can make things happen.
   * https://reddit.atlassian.net/browse/DX-5740
   */
  // 'background',
  // 'background-image',
  'border-image',
  'border-image-source',
  'behavior',
  'expression',
  'list-style-image',
  'cursor',
  'content',
];

const DISALLOWED_ATTRIBUTES = [
  'onload',
  'onerror',
  'onclick',
  'onmouseover',
  /**
   * 1/31/24: We need to allow images so we can make things happen.
   * https://reddit.atlassian.net/browse/DX-5740
   */
  // 'href',
];

function ensureXmlns(svg: string): string {
  if (/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/.test(svg)) {
    return svg;
  }

  return svg.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
}

/**
 * A naive sanitizer that does not rely on any DOMParsing library. This is intended to be ran
 * isomorphic since some parts of Reddit is SSR'ed. This is not intended to cover every single attack
 * vector for an SVG. The expected execution point for SVGs that run through this function is
 * inside of an <img src={svg} />. That prevents any script execution to heavily mitigates XSS
 * attacks.
 */
export function sanitizeSvg(svg: string): string;
export function sanitizeSvg(svg: string | null | undefined): string | undefined;
export function sanitizeSvg(svg: string | null | undefined): string | undefined {
  if (!svg) {
    return undefined;
  }

  if (!svg.trim().startsWith('<svg')) {
    console.log('The provided string is not a valid SVG.');
    return undefined; // Return an empty string if it's not an SVG
  }

  try {
    // Create regex patterns (case-insensitive)
    // eslint-disable-next-line security/detect-non-literal-regexp
    const disallowedElementsRegex = new RegExp(`<\\s*(${DISALLOWED_ELEMENTS.join('|')})\\b`, 'gi');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const disallowedStylesRegex = new RegExp(
      `(${DISALLOWED_STYLES.join('|')})\\s*:\\s*url\\s*\\((['"]?)(.*?)\\2\\)`,
      'gi'
    );
    // eslint-disable-next-line security/detect-non-literal-regexp
    const disallowedAttributesRegex = new RegExp(
      `(${DISALLOWED_ATTRIBUTES.join('|')})\\s*(=\\s*(['"]?)(.*?)\\3)?`,
      'gi'
    );

    // Remove newlines and excessive whitespace
    svg = svg.trim().replace(/\s+/g, ' ');

    // SVGs as data URLs require it to be a valid XML file meaning
    // xmlns is required where it is not within most browsers.
    svg = ensureXmlns(svg);

    // Find disallowed elements, styles, and attributes
    const elementMatches = svg.match(disallowedElementsRegex) || [];
    const styleMatches = svg.match(disallowedStylesRegex) || [];
    const attributeMatches = svg.match(disallowedAttributesRegex) || [];

    let isInvalid = false;
    // Log and sanitize if disallowed elements are found
    if (elementMatches.length > 0) {
      isInvalid = true;
      console.warn(
        `Disallowed elements detected in SVG: ${elementMatches
          .map((x) => x.replace('<', ''))
          .join(', ')}`
      );
    }

    // Log and sanitize if disallowed styles are found
    if (styleMatches.length > 0) {
      isInvalid = true;
      console.warn(
        `Disallowed styles detected in SVG: ${styleMatches.map((x) => x.split(':')[0]).join(', ')}`
      );
    }

    // Log and sanitize if disallowed attributes are found
    if (attributeMatches.length > 0) {
      isInvalid = true;
      console.warn(
        `Disallowed attributes detected in SVG: ${attributeMatches
          .map((x) => x.split('=')[0])
          .join(', ')}`
      );
    }

    if (isInvalid) {
      return undefined;
    }

    return svg; // Return the original SVG string if it's clean
  } catch {
    return undefined;
  }
}
