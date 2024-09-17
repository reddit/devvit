export function abbreviateNumber(value: number): string {
  if (value < 1000) {
    return value.toString();
  }

  const suffixes = ['k', 'M', 'B', 'T']; // Thousands, Millions, Billions, Trillions
  const tier = (Math.log10(value) / 3) | 0; // Determine the tier (0 for 'k', 1 for 'M', etc.)

  if (tier === 0) return value.toString(); // No abbreviation needed

  const suffix = suffixes[tier - 1];
  const scale = Math.pow(10, tier * 3);
  const scaledValue = value / scale;

  // Use toFixed(1) to keep one decimal place and ensure proper rounding
  return scaledValue.toFixed(1) + suffix;
}
