import { assertNonNull, NonNull } from './NonNull.js';

test.each([
  [null, true],
  [undefined, true],
  [0, false],
  [1, false],
  ['', false],
  [' ', false],
  ['a', false],
  [{}, false],
])('Case %#: "%s"', (input, throws) => {
  if (throws) {
    expect(() => NonNull(input)).toThrow();
    expect(() => assertNonNull(input)).toThrow();
  } else {
    expect(NonNull(input)).toBe(input);
    expect(() => assertNonNull(input)).not.toThrow();
  }
});

// @ts-expect-error test nonnull type is allowed.
NonNull('abc');

// @ts-expect-error test nonnull type is allowed.
assertNonNull('abc');

NonNull('abc' as unknown as string | null);
assertNonNull('abc' as unknown as string | null);

NonNull('abc' as unknown as string | undefined);
assertNonNull('abc' as unknown as string | undefined);
