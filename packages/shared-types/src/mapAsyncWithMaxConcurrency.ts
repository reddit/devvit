export async function mapAsyncWithMaxConcurrency<Item, RetVal>(
  array: Item[],
  callback: (item: Item, index: number) => Promise<RetVal>,
  threadLimit: number
): Promise<RetVal[]> {
  // Sanity check: If threadLimit is <= 0, or isn't an int, throw an error
  if (threadLimit <= 0) {
    throw new Error('threadLimit must be greater than 0');
  }
  if (!Number.isInteger(threadLimit)) {
    throw new Error('threadLimit must be an integer');
  }

  // Simple case: if the array length is less than the thread limit, run all in parallel
  if (array.length <= threadLimit) {
    return Promise.all(array.map(callback));
  }

  const results: RetVal[] = [];
  let nextIndex = 0;

  // A worker gets the next item to process until there are no more left
  async function worker() {
    while (nextIndex < array.length) {
      // Thankfully, because JS isn't *actually* multithreaded, this is safe
      const currentIndex = nextIndex;
      nextIndex++;
      // Save the result from the callback to its matching index in the results array
      results[currentIndex] = await callback(array[currentIndex], currentIndex);
    }
  }

  // Spawn a pool of workers equal to the thread limit
  const workers: Promise<void>[] = [];
  for (let i = 0; i < threadLimit; i++) {
    workers.push(worker());
  }

  // Wait for all workers to complete
  await Promise.all(workers);
  return results;
}
