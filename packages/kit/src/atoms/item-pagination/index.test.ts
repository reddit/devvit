import { beforeEach, describe, expect } from 'vitest';
import { usePagination } from './index.js';

describe('usePagination', () => {
  const stubUseState = vi.fn();
  const stubSetState = vi.fn();
  const mockState = { useState: stubUseState };

  beforeEach(() => {
    [stubUseState, stubSetState].forEach((stub) => stub.mockReset());
    stubUseState.mockReturnValue([0, () => {}]);
  });

  it('is a function that receives context, an array of items and a number of items on the page', () => {
    expect(typeof usePagination).toBe('function');
    expect(() => usePagination(mockState, [1, 2, 3], 2)).not.toThrow();
  });

  describe('page count', () => {
    it('outputs the number of pages available', () => {
      const result = usePagination(mockState, [1, 2, 3], 2);
      expect(result.pagesCount).toBe(2);
    });
    it('returns 1 page if there are less items than the itemsPerPage', () => {
      const result = usePagination(mockState, [1, 2, 3], 5);
      expect(result.pagesCount).toBe(1);
    });
    it('returns 3 pages if there are a lot of items', () => {
      const result = usePagination(mockState, [1, 2, 3, 4, 5, 6], 2);
      expect(result.pagesCount).toBe(3);
    });
    it('returns 3 pages if there are a lot of items', () => {
      const result = usePagination(mockState, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
      expect(result.pagesCount).toBe(4);
    });
  });

  describe('paginated items', () => {
    it('returns the slice of input with the specified length', () => {
      const result = usePagination(mockState, [1, 2, 3], 2);
      expect(result.currentItems.length).toBe(2);
    });
    it('returns the whole input if there are less items than itemsPerPage', () => {
      const result = usePagination(mockState, [1, 2, 3], 4);
      expect(result.currentItems.length).toBe(3);
      expect(result.currentItems).toEqual([1, 2, 3]);
    });
    it('preserves types of the input', () => {
      const result = usePagination(
        mockState,
        [
          { id: '1', name: 'John' },
          { id: '2', name: 'Jane' },
          { id: '3', name: 'Carl' },
          { id: '4', name: 'Biscuit' },
        ],
        4
      );
      expect(result.currentItems[3].name).toBe('Biscuit');
    });
  });

  it('returns the page index', () => {
    const result = usePagination(mockState, [1, 2, 3], 2);
    expect(result.currentPage).toBe(0);
  });
  it('isFirstPage by default', () => {
    const result = usePagination(mockState, [1, 2, 3], 2);
    expect(result.isFirstPage).toBe(true);
  });
  it('isLastPage based on the page size', () => {
    const resultLimited = usePagination(mockState, [1, 2, 3], 2);
    expect(resultLimited.isLastPage).toBe(false);
    const resultUnlimited = usePagination(mockState, [1, 2, 3], 4);
    expect(resultUnlimited.isLastPage).toBe(true);
  });
  it('properly handles the small input', () => {
    const result = usePagination(mockState, [1, 2, 3], 5);
    expect(result.currentItems).toEqual([1, 2, 3]);
    expect(result.currentPage).toBe(0);
    expect(result.pagesCount).toBe(1);
    expect(result.isFirstPage).toBe(true);
    expect(result.isLastPage).toBe(true);
    expect(result.toNextPage).toBe(undefined);
    expect(result.toPrevPage).toBe(undefined);
  });

  describe('with different current page', () => {
    it('is not on first page if current page is not 0', () => {
      stubUseState.mockReturnValue([1, () => {}]);
      const result = usePagination(mockState, [1, 2, 3], 2);
      expect(result.isFirstPage).toBe(false);
      expect(result.currentPage).toBe(1);
    });

    it('slices the items for the second page', () => {
      stubUseState.mockReturnValue([1, () => {}]);
      const result = usePagination(mockState, [1, 2, 3, 4, 5], 2);
      expect(result.currentItems).toEqual([3, 4]);
    });

    it('handles the incomplete last page', () => {
      stubUseState.mockReturnValue([1, () => {}]);
      const result = usePagination(mockState, [1, 2, 3, 4, 5], 3);
      expect(result.currentItems).toEqual([4, 5]);
    });

    it('throws if page is negative', () => {
      stubUseState.mockReturnValue([-1, () => {}]);
      expect(() => {
        usePagination(mockState, [1, 2, 3, 4, 5], 3);
      }).toThrow();
    });

    it('detects the last page', () => {
      stubUseState.mockReturnValue([1, () => {}]);
      const result = usePagination(mockState, [1, 2, 3, 4, 5], 3);
      expect(result.isLastPage).toBe(true);
    });
  });

  it('initializes the state on the first page', () => {
    const paginationResponse = usePagination(mockState, [1, 2, 3], 2);
    expect(stubUseState).toBeCalledWith(0);
    expect(paginationResponse.currentItems).toEqual([1, 2]);
  });

  it('does not paginate prev from the first page', () => {
    const paginationResponse = usePagination(mockState, [1, 2, 3], 2);
    expect(paginationResponse.toPrevPage).toBeUndefined();
  });

  it('can paginate prev from the second page', () => {
    stubUseState.mockReturnValue([1, () => {}]);
    const paginationResponse = usePagination(mockState, [1, 2, 3], 2);
    expect(paginationResponse.toPrevPage).not.toBeUndefined();
  });

  it('sets prev page when toPrevPage is called', () => {
    stubUseState.mockReturnValue([1, stubSetState]);
    const paginationResponse = usePagination(mockState, [1, 2, 3], 2);
    paginationResponse.toPrevPage!();
    expect(stubSetState).toBeCalledWith(0);
  });

  it('does not paginate next from the last page', () => {
    const paginationResponse = usePagination(mockState, [1, 2, 3], 5);
    expect(paginationResponse.toNextPage).toBeUndefined();
  });

  it('can paginate next from the first page', () => {
    const paginationResponse = usePagination(mockState, [1, 2, 3], 2);
    expect(paginationResponse.toNextPage).not.toBeUndefined();
  });

  it('sets next page when toNextPage is called', () => {
    stubUseState.mockReturnValue([0, stubSetState]);
    const paginationResponse = usePagination(mockState, [1, 2, 3], 2);
    paginationResponse.toNextPage!();
    expect(stubSetState).toBeCalledWith(1);
  });
});
