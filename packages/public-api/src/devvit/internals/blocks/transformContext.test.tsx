/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

// This import is NOT unused, don't listen to your IDE
// noinspection ES6UnusedImports
import { describe, expect, test } from 'vitest';

import { BlockStackDirection } from '@devvit/protos';
import { calculateMaxDimensions } from './transformContext.js';

describe('calculateMaxDimensions', () => {
  const defaultMaxDimensions = {
    height: 500,
    width: 400,
    scale: 1,
    fontScale: 1,
  };

  test('returns the existing context when no props', () => {
    const maxDimensions = calculateMaxDimensions(
      undefined,
      defaultMaxDimensions,
      BlockStackDirection.STACK_HORIZONTAL,
      0
    );
    expect(maxDimensions).toStrictEqual(defaultMaxDimensions);
  });

  test('returns updated height when height set in props', () => {
    const maxDimensions = calculateMaxDimensions(
      { height: 50, width: 50 },
      defaultMaxDimensions,
      BlockStackDirection.STACK_HORIZONTAL,
      2
    );
    expect(maxDimensions).toStrictEqual({
      ...defaultMaxDimensions,
      height: 250,
      width: 200,
    });
  });

  test('returns updated height when border set in props', () => {
    const maxDimensions = calculateMaxDimensions(
      { border: 'thick' },
      defaultMaxDimensions,
      BlockStackDirection.STACK_HORIZONTAL,
      2
    );
    expect(maxDimensions).toStrictEqual({
      ...defaultMaxDimensions,
      height: 496,
      width: 396,
    });
  });

  test('returns updated height when height with hstack gap offsets when set in props', () => {
    const maxDimensions = calculateMaxDimensions(
      { height: 50, width: 50, gap: 'small' },
      defaultMaxDimensions,
      BlockStackDirection.STACK_HORIZONTAL,
      2
    );
    expect(maxDimensions).toStrictEqual({
      ...defaultMaxDimensions,
      height: 250,
      width: 192,
    });
  });

  test('returns updated height when height with vstack gap offsets when set in props', () => {
    const maxDimensions = calculateMaxDimensions(
      { height: 50, width: 50, gap: 'small' },
      defaultMaxDimensions,
      BlockStackDirection.STACK_VERTICAL,
      2
    );
    expect(maxDimensions).toStrictEqual({
      ...defaultMaxDimensions,
      height: 242,
      width: 200,
    });
  });

  test('returns updated height when height with padding offsets when set in props', () => {
    const maxDimensions = calculateMaxDimensions(
      { height: 50, width: 50, padding: 'small' },
      defaultMaxDimensions,
      BlockStackDirection.STACK_HORIZONTAL,
      2
    );
    expect(maxDimensions).toStrictEqual({
      ...defaultMaxDimensions,
      height: 234,
      width: 184,
    });
  });

  test('returns updated height when height with padding offsets when set in props and font scale is not default', () => {
    const highFontScaleDimensions = { height: 500, width: 400, scale: 1, fontScale: 2 };
    const context = calculateMaxDimensions(
      { height: 50, width: 50, padding: 'small' },
      highFontScaleDimensions,
      BlockStackDirection.STACK_HORIZONTAL,
      2
    );
    expect(context).toEqual({
      ...highFontScaleDimensions,
      height: 218,
      width: 168,
    });
  });
});
