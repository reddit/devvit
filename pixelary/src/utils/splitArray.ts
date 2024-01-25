export function splitArray<T>(array: T[], segmentLength: number): T[][] {
  if (segmentLength <= 0) {
    throw new Error('Segment length must be greater than 0.');
  }

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += segmentLength) {
    result.push(array.slice(i, i + segmentLength));
  }

  return result;
}
