## JSON

Several APIs in Devvit only accept plain [JSON](https://www.json.org) data which is typed as `JSONValue`. The JSON format is used to save data because it's lossless, simple, and ubiquitous. If you attempt to pass a `class` instance, `interface` instance, or other incompatible type, the TypeScript compiler will flag it as an error. Type errors such as these are intended to provide quick feedback that your program probably won't work as intended.

### Example Problem: Class and `Context.useState()`

```ts
import { Devvit, useState } from '@devvit/public-api';

class Foo {}
const [foo, setFoo] = useState(new Foo()); // Error!
```

```
No overload matches this call.
  The last overload gave the following error.
    Argument of type 'Foo' is not assignable to parameter of type 'void | JSONValue | (() => void | JSONValue | Promise<void | JSONValue>)'.ts(2769)
```

### Example Problem: Interface and `KVStore.put()`

```ts
interface Bar {}
const bar: Bar = {};
await context.kvStore.put('foo', bar); // Error!
```

```
Argument of type 'Bar' is not assignable to parameter of type 'JSONValue'.
```

### What Is JSON?

In Devvit, JSON is typed as `JSONValue` which is a string, number, boolean, null, an array of any of these, or an object of these values, recursively.

All of the following are examples of valid JSON values:

```ts
const a: JSONValue = 'abc';
const b: JSONValue = 1;
const c: JSONValue = false;
const d: JSONValue = null;
const e: JSONValue = [];
const f: JSONValue = {};
const g: JSONValue = { a: 123 };
const h: JSONValue = [{ a: 123 }, 1, null];
```

None of the following are valid JSON values:

```ts
class Foo {}
const a: JSONValue = new Foo(); // Error!
const b: JSONValue = new Map(); // Error!
const c: JSONValue = new Set(); // Error!
const d: JSONValue = new Date(); // Error!
```

### Solutions

#### Prefer `type` Instead of `interface`

It's always safe to favor `type` over `interface`. The compiler will tell you if there's a problem.

```ts
// Problem
interface Fruit {
  type: 'Apple' | 'Banana';
}
```

```ts
// Solution
type Fruit = { type: 'Apple' | 'Banana' };
```

`interface` is open, `type` is closed. You don't normally need or want open typing because they're harder to reason about. See [a playground demonstrating their distinction](https://www.typescriptlang.org/play?ssl=11&ssc=1&pln=12&pc=1#code/PTAEEkDsBcFMCcBmBDAxrAzqZ9bYDYDuyAnlgPYAOskAdALABQAljAiuqAPLWRRxI0eAN5NQ2AFyhIAVwC2AIwRMAvkyYgIbQeiypkkAsTKgloWAA84kACawbDFto54eNfuyGhRjcQqmyisqMaowaYAAC0BgAtJbUqNBx8PDk8Eyo5JAY0KBUNFJufM5eALzeyFIAjAA0plIATCqgmgCiFglwNqDQ5KAAFsgAbnjI2LamAITqjJoAKiTUWDijRKR6+OQY9rSgAJrkMqD6hln4JKB2iKyjoAAG0Iuwd3mQ6NOzkdFxHbCJyal0oxHtRQABhTbbGwLUHlHziSrSeRKIGhcKgKKxeJ-JIIQFMEF4CFbewwvBwsT1JFBVFAA) and [a related discussion in the TypeScript issue tracker](https://github.com/microsoft/TypeScript/issues/15300).

##### When Would I Need an Interface?

Rarely. A good example are Lit components. These are the default tags TypeScript knows of:

```ts
interface HTMLElementTagNameMap {
    "a": HTMLAnchorElement;
    "abbr": HTMLElement;
    "address": HTMLElement;
    "area": HTMLAreaElement;
    "article": HTMLElement;
    ...
```

If we were to define a custom component like `foo-bar`, we can augment TypeScripts knowledge:

```ts
declare global {
  interface HTMLElementTagNameMap {
    'foo-bar': FooBar;
  }
}
```

#### Separate Data and Behavior

```ts
// Problem
class XY {
  constructor(
    public x: number,
    public y: number
  ) {}

  add(xy: XY): void {
    this.x += xy.x;
    this.y += xy.y;
  }
}
```

```ts
// Solution
type XY = { x: number; y: number };

function addEq(lhs: XY, rhs: XY): void {
  lhs.x += rhs.x;
  lhs.y += rhs.y;
}
```

#### Serialize and Deserialize

This is an example program for rectangle and coordinate classes. Both classes are typical in that they have state and methods. Additionally, the rectangle composes the coordinate.

```ts
type BoxJSON = { start: XYJSON; end: XYJSON };
class Box {
  static fromJSON(json: Partial<BoxJSON> | undefined): Box {
    const start = XY.fromJSON(json?.start);
    const end = XY.fromJSON(json?.end);
    return new Box(start.x, start.y, end.x, end.y);
  }

  #start: XY;
  #end: XY;

  constructor(x: number, y: number, w: number, h: number) {
    this.#start = new XY(x, y);
    this.#end = new XY(x + w, y + h);
  }

  /** Return as a vector. */
  toXY(): XY {
    return this.#end.sub(this.#start);
  }

  toJSON(): BoxJSON {
    return { start: this.#start.toJSON(), end: this.#end.toJSON() };
  }
}

type XYJSON = { x: number; y: number };
class XY {
  static fromJSON(json: Partial<XYJSON> | undefined): XY {
    return new XY(json?.x ?? 0, json?.y ?? 0);
  }

  constructor(
    public x: number,
    public y: number
  ) {}

  sub(xy: Readonly<XY>): XY {
    return new XY(this.x - xy.x, this.y - xy.y);
  }

  toJSON(): XYJSON {
    return { x: this.x, y: this.y };
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}

const original = new Box(0, 0, 1, 1);
const json = JSON.stringify(original);
console.log(`BoxJSON: ${json}`);
const revived = Box.fromJSON(JSON.parse(json));
console.log(`Revived Box: ${revived instanceof Box}; as vec: ${revived.toXY()}`);
```
