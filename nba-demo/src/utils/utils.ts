export function generateRandomHash(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomValue = Math.random().toString(16).substr(2, 8);
    result += randomValue.slice(0, Math.min(8, length - i));
  }
  return result;
}

type WeightedOption<T> = {
  value: T;
  weight: number;
};

export function selectWeightedOption<T>(options: WeightedOption<T>[]): T {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  let random = Math.random() * totalWeight;

  for (const option of options) {
    random -= option.weight;
    if (random <= 0) {
      return option.value;
    }
  }

  throw new Error('No options provided or weights are invalid');
}
