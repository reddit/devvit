import type { Devvit } from '../devvit/Devvit.js';

test('typing is intuitive', () => {
  const _: Devvit.BlockComponent = (_, ctx) => {
    ctx.useChannel({
      name: 'name',
      onMessage() {},
    });

    ctx.useChannel({
      name: 'name',
      onMessage(): void {},
    });

    ctx.useChannel({
      name: 'name',
      onMessage(): undefined {},
    });

    ctx.useChannel({
      name: 'name',
      // @ts-expect-error
      async onMessage() {},
    });

    ctx.useChannel({
      name: 'name',
      // @ts-expect-error
      async onMessage(): Promise<void> {},
    });

    ctx.useChannel({
      name: 'name',
      // @ts-expect-error
      async onMessage(): Promise<undefined> {},
    });

    return null;
  };
});
