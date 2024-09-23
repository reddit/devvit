import type { KVStore } from './kvStore.js';

test('typing is intuitive', async () => {
  const kv: KVStore = {
    async get<T>() {
      return {} as T;
    },
    async put() {},
    async delete() {},
    async list() {
      return [];
    },
  };
  await kv.put('key', 'abc');
  await kv.put('key', 1);
  await kv.put('key', false);
  await kv.put('key', null);
  await kv.put('key', []);
  await kv.put('key', {});
  await kv.put('key', { a: 123 });
  await kv.put('key', [{ a: 123 }, 1, null]);
  type Foo = {
    bar: string;
  };
  const foo: Foo = { bar: 'abc' };
  await kv.put('key', foo);
  // @ts-expect-error test bad type.
  await kv.put('key', undefined);
  // @ts-expect-error test bad type.
  await kv.put('key', new (class {})());
  // @ts-expect-error test bad type.
  await kv.put('key', new Map());
  // @ts-expect-error test bad type.
  await kv.put('key', new Set());
  // @ts-expect-error test bad type.
  await kv.put('key', new Date());
  // @ts-expect-error test bad type.
  await kv.put('key', () => Promise.resolve(new (class {})()));
  // @ts-expect-error test bad type.
  await kv.put('key', () => Promise.resolve(new Map()));
  // @ts-expect-error test bad type.
  await kv.put('key', () => Promise.resolve(new Set()));
  // @ts-expect-error test bad type.
  await kv.put('key', () => Promise.resolve(new Date()));
});
