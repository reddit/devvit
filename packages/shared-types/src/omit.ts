export function omit<T extends Record<string, unknown>, K extends keyof T & string>(
  input: T,
  key: K
): Omit<T, K> {
  return Object.keys(input).reduce<Omit<T, K>>(
    (output, inputKey) => {
      if (inputKey === key) {
        return output;
      }

      return {
        ...output,
        [inputKey]: input[inputKey],
      };
    },
    {} as Omit<T, K>
  );
}
