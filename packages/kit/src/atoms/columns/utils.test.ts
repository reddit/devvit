import { splitItems, splitItemsColumnFill, splitItemsRow } from './utils.js';
import { describe, expect } from 'vitest';

describe('splitItems', () => {
  describe('column-fill', () => {
    describe('one column', () => {
      it('returns copy of input if there are less items than max rows', () => {
        expect(splitItemsColumnFill([1, 2, 3], 1, 5)).toEqual([[1, 2, 3]]);
      });
      it('truncates input if there are more items than max rows', () => {
        expect(splitItemsColumnFill([1, 2, 3, 4, 5], 1, 3)).toEqual([[1, 2, 3]]);
      });
    });
    describe('multiple columns', () => {
      it('always returns requested amount of columns', () => {
        expect(splitItemsColumnFill([1, 2, 3], 2, 5)).toEqual([[1, 2, 3], []]);
      });
      it('stops filling when there are too many items', () => {
        expect(splitItemsColumnFill([1, 2, 3, 4, 5], 2, 2)).toEqual([
          [1, 2],
          [3, 4],
        ]);
      });
      it('fills last column last', () => {
        expect(splitItemsColumnFill([1, 2, 3, 4, 5], 3, 2)).toEqual([[1, 2], [3, 4], [5]]);
      });
    });
  });
  describe('column', () => {
    describe('one column', () => {
      it('returns copy of input if there are less items than max rows', () => {
        expect(splitItems([1, 2, 3], 1, 5)).toEqual([[1, 2, 3]]);
      });
      it('truncates input if there are more items than max rows', () => {
        expect(splitItems([1, 2, 3, 4, 5], 1, 3)).toEqual([[1, 2, 3]]);
      });
    });
    describe('multiple columns', () => {
      it('splits columns equally when possible', () => {
        expect(splitItems([1, 2, 3, 4, 5], 2, 2)).toEqual([
          [1, 2],
          [3, 4],
        ]);
        expect(splitItems([1, 2, 3, 4, 5, 6], 3, Infinity)).toEqual([
          [1, 2],
          [3, 4],
          [5, 6],
        ]);
      });
      it('distributes extra items starting from the first column', () => {
        expect(splitItems([1, 2, 3, 4, 5, 6, 7], 5, Infinity)).toEqual([
          [1, 2],
          [3, 4],
          [5],
          [6],
          [7],
        ]);
      });
    });
  });
  describe('row', () => {
    it('returns as many columns as specified', () => {
      expect(splitItemsRow([1, 2, 3], 2, 4).length).toBe(2);
    });
    it('fills the first row first', () => {
      expect(splitItemsRow([1, 2, 3], 2, 4)).toEqual([[1, 3], [2]]);
    });
    it('cuts off array when max rows is specified', () => {
      expect(splitItemsRow([1, 2, 3, 4, 5, 6], 2, 2)).toEqual([
        [1, 3],
        [2, 4],
      ]);
    });
    it('does not limit if max rows is omitted', () => {
      expect(splitItemsRow([1, 2, 3, 4, 5, 6], 2, Infinity)).toEqual([
        [1, 3, 5],
        [2, 4, 6],
      ]);
    });
    it('returns empty columns if no items provided', () => {
      expect(splitItemsRow([], 4, Infinity)).toEqual([[], [], [], []]);
    });
  });
});
