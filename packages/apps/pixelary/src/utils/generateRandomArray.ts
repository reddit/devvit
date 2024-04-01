export function generateRandomArray(length: number): number[] {
  const randomArray: number[] = [];

  for (let i = 0; i < length; i++) {
    // Generate a random number (either 0 or 1)
    const randomValue = Math.round(Math.random());
    randomArray.push(randomValue);
  }

  return randomArray;
}
