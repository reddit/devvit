import { describe, expect, test } from 'vitest';

import { getHexFromRgbaColor, getHexFromRPLColor, isHexColor, isRPLColor } from './color.js';

describe('color', () => {
  describe('isHexColor', () => {
    test('should pass when is a valid hex color', async () => {
      expect(isHexColor('#00008b')).toBeTruthy();
    });

    test('should fail when is not a valid hex color', async () => {
      expect(isHexColor('3ds008b')).toBeFalsy();
    });
  });

  describe('isRPLColor', () => {
    test('should pass when is a valid rpl color', async () => {
      expect(isRPLColor('orangered-500')).toBeTruthy();
    });

    test('should fail when is not a valid rpl color', async () => {
      expect(isRPLColor('best-color-201')).toBeFalsy();
    });
  });

  describe('getHexFromRPLColor', () => {
    test('should pass when is a valid rpl color', async () => {
      expect(getHexFromRPLColor('orangered-500')).toEqual('#D93900');
    });

    test('should give named color result', async () => {
      expect(getHexFromRPLColor('transparent')).toEqual('#FFFFFF00');
    });
  });

  describe('getHexFromRgbaColor', () => {
    test('should pass when is a valid rgb color', async () => {
      expect(getHexFromRgbaColor('rgb(255, 100, 100)')).toEqual('#ff6464');
    });

    test('should pass when is a valid rgb color and adds correct padding', async () => {
      expect(getHexFromRgbaColor('rgb(14, 21, 4)')).toEqual('#0e1504');
    });

    test('should fail when is not a valid rgb color', async () => {
      expect(getHexFromRgbaColor('rgb(255)')).toEqual('rgb(255)');
    });

    test('should pass when is a valid rgba color', async () => {
      expect(getHexFromRgbaColor('rgba(255, 100, 100, 0.1)')).toEqual('#ff64641a');
    });
  });
});
