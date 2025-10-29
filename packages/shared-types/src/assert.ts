export function assert(condition: boolean, msg?: string): asserts condition {
  if (!condition) throw Error(msg);
}
