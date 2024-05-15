import type { Devvit } from '@devvit/public-api';

export type UsePaginationReturn<ItemType> = {
  pagesCount: number;
  currentItems: Array<ItemType>;
  currentPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  toPrevPage: undefined | (() => void);
  toNextPage: undefined | (() => void);
};

export function usePagination<ItemType>(
  context: Pick<Devvit.Context, 'useState'>,
  items: ItemType[],
  itemsPerPage: number
): UsePaginationReturn<ItemType> {
  const [currentPage, setCurrentPage] = context.useState(0);

  if (currentPage < 0) {
    throw new Error('Failed to paginate for page: -1');
  }

  const divisionResult = items.length / itemsPerPage;
  const pagesCount = Math.ceil(divisionResult);

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === pagesCount - 1;
  return {
    currentPage,
    pagesCount,
    currentItems: items.slice(
      currentPage * itemsPerPage,
      currentPage * itemsPerPage + itemsPerPage
    ),
    isFirstPage,
    isLastPage,
    toPrevPage: isFirstPage
      ? undefined
      : () => {
          setCurrentPage(currentPage - 1);
        },
    toNextPage: isLastPage
      ? undefined
      : () => {
          setCurrentPage(currentPage + 1);
        },
  };
}
