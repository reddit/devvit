import {
  BlockHorizontalAlignment,
  BlockStackDirection,
  BlockVerticalAlignment,
} from '@devvit/protos';
import { makeBlockSizes } from './transformerUtils.js';

describe('makeBlockSizes', () => {
  describe('hstack parent', () => {
    test('relative width, parent no alignment, does not omit', () => {
      const blockSizes = makeBlockSizes(
        { width: '50%' },
        {
          stackParentLayout: {
            alignment: undefined,
            direction: BlockStackDirection.STACK_HORIZONTAL,
            hasHeight: false,
            hasWidth: true,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        height: undefined,
        width: { max: undefined, min: undefined, value: { value: 50, unit: 0 } },
      });
    });
    test('relative width, parent with alignment, does not omit', () => {
      const blockSizes = makeBlockSizes(
        { width: '50%' },
        {
          stackParentLayout: {
            alignment: {
              vertical: BlockVerticalAlignment.ALIGN_TOP,
              horizontal: BlockHorizontalAlignment.ALIGN_START,
            },
            direction: BlockStackDirection.STACK_HORIZONTAL,
            hasHeight: false,
            hasWidth: true,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        height: undefined,
        width: { max: undefined, min: undefined, value: { value: 50, unit: 0 } },
      });
    });
    test('relative width, parent has no width, does omit', () => {
      const blockSizes = makeBlockSizes(
        { width: '50%' },
        {
          stackParentLayout: {
            alignment: {
              vertical: BlockVerticalAlignment.ALIGN_TOP,
              horizontal: BlockHorizontalAlignment.ALIGN_START,
            },
            direction: BlockStackDirection.STACK_HORIZONTAL,
            hasHeight: false,
            hasWidth: false,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        height: undefined,
        width: undefined,
      });
    });
    test('relative min width, parent no alignment, does not omit', () => {
      const blockSizes = makeBlockSizes(
        { minWidth: '50%' },
        {
          stackParentLayout: {
            alignment: undefined,
            direction: BlockStackDirection.STACK_HORIZONTAL,
            hasHeight: false,
            hasWidth: true,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        height: undefined,
        width: { max: undefined, min: { value: 50, unit: 0 }, value: undefined },
      });
    });
    test('relative min width, parent with alignment, does not omit', () => {
      const blockSizes = makeBlockSizes(
        { minWidth: '50%' },
        {
          stackParentLayout: {
            alignment: {
              vertical: BlockVerticalAlignment.ALIGN_TOP,
              horizontal: BlockHorizontalAlignment.ALIGN_START,
            },
            direction: BlockStackDirection.STACK_HORIZONTAL,
            hasHeight: false,
            hasWidth: true,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        height: undefined,
        width: { max: undefined, min: { value: 50, unit: 0 }, value: undefined },
      });
    });
    test('relative min width, parent has no width, does omit', () => {
      const blockSizes = makeBlockSizes(
        { minWidth: '50%' },
        {
          stackParentLayout: {
            alignment: {
              vertical: BlockVerticalAlignment.ALIGN_TOP,
              horizontal: BlockHorizontalAlignment.ALIGN_START,
            },
            direction: BlockStackDirection.STACK_HORIZONTAL,
            hasHeight: false,
            hasWidth: false,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        height: undefined,
        width: undefined,
      });
    });
  });
  describe('vstack parent', () => {
    test('relative height, parent no alignment, does not omit', () => {
      const blockSizes = makeBlockSizes(
        { height: '50%' },
        {
          stackParentLayout: {
            alignment: undefined,
            direction: BlockStackDirection.STACK_VERTICAL,
            hasHeight: true,
            hasWidth: false,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        width: undefined,
        height: { max: undefined, min: undefined, value: { value: 50, unit: 0 } },
      });
    });
    test('relative height, parent with alignment, does not omit', () => {
      const blockSizes = makeBlockSizes(
        { height: '50%' },
        {
          stackParentLayout: {
            alignment: {
              vertical: BlockVerticalAlignment.ALIGN_TOP,
              horizontal: BlockHorizontalAlignment.ALIGN_START,
            },
            direction: BlockStackDirection.STACK_VERTICAL,
            hasHeight: true,
            hasWidth: false,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        width: undefined,
        height: { max: undefined, min: undefined, value: { value: 50, unit: 0 } },
      });
    });
    test('relative height, parent has no height, does omit', () => {
      const blockSizes = makeBlockSizes(
        { height: '50%' },
        {
          stackParentLayout: {
            alignment: {
              vertical: BlockVerticalAlignment.ALIGN_TOP,
              horizontal: BlockHorizontalAlignment.ALIGN_START,
            },
            direction: BlockStackDirection.STACK_VERTICAL,
            hasHeight: false,
            hasWidth: false,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        height: undefined,
        width: undefined,
      });
    });
    test('relative minHeight, parent no alignment, does not omit', () => {
      const blockSizes = makeBlockSizes(
        { minHeight: '50%' },
        {
          stackParentLayout: {
            alignment: undefined,
            direction: BlockStackDirection.STACK_VERTICAL,
            hasHeight: true,
            hasWidth: false,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        width: undefined,
        height: { max: undefined, min: { value: 50, unit: 0 }, value: undefined },
      });
    });
    test('relative minHeight, parent with alignment, does not omit', () => {
      const blockSizes = makeBlockSizes(
        { minHeight: '50%' },
        {
          stackParentLayout: {
            alignment: {
              vertical: BlockVerticalAlignment.ALIGN_TOP,
              horizontal: BlockHorizontalAlignment.ALIGN_START,
            },
            direction: BlockStackDirection.STACK_VERTICAL,
            hasHeight: true,
            hasWidth: false,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        width: undefined,
        height: { max: undefined, min: { value: 50, unit: 0 }, value: undefined },
      });
    });
    test('relative minHeight, parent has no height, does omit', () => {
      const blockSizes = makeBlockSizes(
        { minHeight: '50%' },
        {
          stackParentLayout: {
            alignment: {
              vertical: BlockVerticalAlignment.ALIGN_TOP,
              horizontal: BlockHorizontalAlignment.ALIGN_START,
            },
            direction: BlockStackDirection.STACK_VERTICAL,
            hasHeight: false,
            hasWidth: false,
          },
        }
      );
      expect(blockSizes).toEqual({
        grow: undefined,
        height: undefined,
        width: undefined,
      });
    });
  });
});
