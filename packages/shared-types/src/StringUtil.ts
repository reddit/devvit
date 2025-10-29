export namespace StringUtil {
  /**
   * Returns a string, truncated as needed, of length limit or less. When
   * truncated, appends "…".
   */
  export function ellipsize(str: string, limit: number): string {
    return str.length <= limit ? str : `${str.slice(0, limit - 1)}…`;
  }

  /** Converts the first character of str to uppercase. */
  export function capitalize<T extends string>(str: T): Capitalize<T> {
    if (str[0] == null) return str as Capitalize<T>;
    return `${str[0].toLocaleUpperCase()}${str.slice(1)}` as Capitalize<T>;
  }

  /** Returns true if string is nullish, empty, or whitespace-only. */
  export function isBlank(str: string | undefined | null): boolean {
    return str == null || /^\s*$/.test(str);
  }

  /**
   * Converts an unknown type to a verbose stacktrace if an error or string form
   * otherwise.
   */
  export function caughtToString(
    val: unknown,
    preferredErrorProperty: 'stack' | 'message' | 'name' = 'stack'
  ): string {
    return val instanceof Error
      ? `${val[preferredErrorProperty] || val.stack || val.message || val.name}`
      : String(val);
  }

  /**
   * Converts an unknown type to a verbose stacktrace if an error or string form
   * otherwise. Prefer caughtToString where possible for typing reasons.
   */
  export function caughtToStringUntyped(
    val: unknown,
    preferredErrorProperty: string = 'stack'
  ): string {
    return val instanceof Error
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `${(val as any)[preferredErrorProperty] || val.stack || val.message || val.name}`
      : String(val);
  }
}
