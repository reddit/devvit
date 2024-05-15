export function splitItems<T>(input: T[], columns: number, maxRows: number): T[][] {
  const maxItemsDisplayed = Math.min(
    maxRows === Infinity ? input.length : columns * maxRows,
    input.length
  );
  const itemsToDistribute = input.slice(0, maxItemsDisplayed);
  const guaranteedItemsInColumn = Math.floor(itemsToDistribute.length / columns);
  let distributedCount = 0;
  const result: T[][] = Array(columns)
    .fill(null)
    .map(() => []);
  for (let i = 0; i < columns; i++) {
    const startIndex = distributedCount;
    const itemsLeftCount = itemsToDistribute.length - distributedCount;
    const columnsLeft = columns - i;
    const itemsToAdd =
      itemsLeftCount % columnsLeft ? guaranteedItemsInColumn + 1 : guaranteedItemsInColumn;
    result[i] = itemsToDistribute.slice(startIndex, startIndex + itemsToAdd);
    distributedCount += itemsToAdd;
  }
  return result;
}

export function splitItemsColumnFill<T>(input: T[], columns: number, maxRows: number): T[][] {
  const maxItemsDisplayed = Math.min(
    maxRows === Infinity ? input.length : columns * maxRows,
    input.length
  );
  const result: T[][] = Array(columns)
    .fill(null)
    .map(() => []);
  let currentColumn = 0;
  let currentRow = 0;
  for (let i = 0; i < maxItemsDisplayed; i++) {
    if (currentRow >= maxRows) {
      currentRow = 0;
      currentColumn += 1;
    }
    result[currentColumn].push(input[i]);
    currentRow += 1;
  }
  return result;
}

export function splitItemsRow<T>(input: T[], columns: number, maxRows: number): T[][] {
  const maxItemsDisplayed = Math.min(
    maxRows === Infinity ? input.length : columns * maxRows,
    input.length
  );
  const result: T[][] = Array(columns)
    .fill(null)
    .map(() => []);
  let currentColumn = 0;
  for (let i = 0; i < maxItemsDisplayed; i++) {
    if (currentColumn >= columns) {
      currentColumn = 0;
    }
    result[currentColumn].push(input[i]);
    currentColumn += 1;
  }
  return result;
}
