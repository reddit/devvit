import { isT1, isT2, isT3, isT4, isT5, isT6, T_PREFIX, T1, T2, T3, T4, T5 } from './tid.js';

describe('Thing IDs', () => {
  it('never changes', () => {
    expect(T_PREFIX).toMatchSnapshot();
  });

  it('Tx_ Types are strict and correct', () => {
    const idSubstring = 'some_id_string';
    for (const prefix of Object.values(T_PREFIX)) {
      const idRaw = `${prefix}${idSubstring}`;
      switch (prefix) {
        case T_PREFIX.COMMENT:
          expect(isT1(idRaw)).toBe(true);
          expect(() => T2(idRaw)).toThrow();
          expect(() => T3(idRaw)).toThrow();
          expect(() => T4(idRaw)).toThrow();
          expect(() => T5(idRaw)).toThrow();
          break;
        case T_PREFIX.ACCOUNT:
          expect(isT2(idRaw)).toBe(true);
          expect(() => T1(idRaw)).toThrow();
          expect(() => T3(idRaw)).toThrow();
          expect(() => T4(idRaw)).toThrow();
          expect(() => T5(idRaw)).toThrow();
          break;
        case T_PREFIX.LINK:
          expect(isT3(idRaw)).toBe(true);
          expect(() => T1(idRaw)).toThrow();
          expect(() => T2(idRaw)).toThrow();
          expect(() => T4(idRaw)).toThrow();
          expect(() => T5(idRaw)).toThrow();
          break;
        case T_PREFIX.MESSAGE:
          expect(isT4(idRaw)).toBe(true);
          expect(() => T1(idRaw)).toThrow();
          expect(() => T2(idRaw)).toThrow();
          expect(() => T3(idRaw)).toThrow();
          expect(() => T5(idRaw)).toThrow();
          break;
        case T_PREFIX.SUBREDDIT:
          expect(isT5(idRaw)).toBe(true);
          expect(() => T1(idRaw)).toThrow();
          expect(() => T2(idRaw)).toThrow();
          expect(() => T3(idRaw)).toThrow();
          expect(() => T4(idRaw)).toThrow();
          break;
        case T_PREFIX.AWARD:
          expect(isT6(idRaw)).toBe(true);
          expect(() => T1(idRaw)).toThrow();
          expect(() => T2(idRaw)).toThrow();
          expect(() => T3(idRaw)).toThrow();
          expect(() => T4(idRaw)).toThrow();
          expect(() => T5(idRaw)).toThrow();
          break;
        default:
          throw new Error(`Unexpected prefix: ${prefix}`);
      }
    }
  });
});
