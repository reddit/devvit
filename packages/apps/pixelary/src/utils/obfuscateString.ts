export function obfuscateString(input: string): string {
  return input
    .split('')
    .map((char) => (char === ' ' ? ' ' : '*'))
    .join('');
}
