/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { describe, it, expect } from 'vitest';
import { makeStackDimensionsDetails } from './transformContext.js';
import { BlockHorizontalAlignment, BlockVerticalAlignment } from '@devvit/protos';

describe('transform context', () => {
  describe('makeStackDimensionsDetails', () => {
    const blockSizesDefault = {
      grow: undefined,
      height: undefined,
      width: { max: undefined, min: undefined, value: { value: 50, unit: 0 } },
    };
    it('should return hasHeight true, hasWidth true when width and height are set on block', () => {
      const result = makeStackDimensionsDetails(
        { width: '50%', height: '50%' },
        {
          hasHeight: true,
          hasWidth: true,
          direction: 0,
          alignment: undefined,
        },
        blockSizesDefault
      );
      expect(result).toStrictEqual({ hasHeight: true, hasWidth: true });
    });
    it('should return hasHeight false, hasWidth true when only width is set on block', () => {
      const result = makeStackDimensionsDetails(
        { width: '50%' },
        {
          hasHeight: false,
          hasWidth: true,
          direction: 0,
          alignment: undefined,
        },
        blockSizesDefault
      );
      expect(result).toStrictEqual({ hasHeight: false, hasWidth: true });
    });
    it('should return hasHeight true when width is not set, but hstack parent is stretching', () => {
      const result = makeStackDimensionsDetails(
        {},
        {
          hasHeight: true,
          hasWidth: true,
          direction: 0,
          alignment: undefined,
        },
        {
          grow: undefined,
          height: undefined,
          width: undefined,
        }
      );
      expect(result).toStrictEqual({ hasHeight: true, hasWidth: false });
    });
    it('should return hasHeight false when width is not set, but hstack parent has alignment', () => {
      const result = makeStackDimensionsDetails(
        {},
        {
          hasHeight: true,
          hasWidth: true,
          direction: 0,
          alignment: {
            horizontal: BlockHorizontalAlignment.ALIGN_CENTER,
            vertical: BlockVerticalAlignment.ALIGN_MIDDLE,
          },
        },
        {
          grow: undefined,
          height: undefined,
          width: undefined,
        }
      );
      expect(result).toStrictEqual({ hasHeight: false, hasWidth: false });
    });
  });
});
