/** @internal */
export function abbreviate(str: string): string {
  return str.length > 256 ? `${str.slice(0, 256)}…` : str;
}
