import fs from 'node:fs/promises';
import path from 'node:path';

import { ACTOR_SRC_DIR, ACTOR_SRC_PRIMARY_NAME } from '@devvit/shared-types/constants.js';
import { lastValueFrom, take, toArray } from 'rxjs';

import { Bundler } from './Bundler.js';

let bundler: Bundler;

beforeEach(() => {
  bundler = new Bundler();
});

afterEach(async () => {
  await bundler.dispose();
});

test('watch touched source', async () => {
  const actorDir = path.join(__dirname, '..', 'templates', 'experience-post', ACTOR_SRC_DIR);
  const observable = bundler.watch(actorDir, {
    name: ACTOR_SRC_PRIMARY_NAME,
    owner: 'owner',
    version: '1.2.3.4',
  });

  const [init, first] = await lastValueFrom(observable.pipe(take(2), toArray()));

  // An empty message is sent initially.
  expect(init).not.toBeUndefined();
  expect(init.bundles).toHaveLength(0);

  expect(first).toBeDefined();
  expect(first!.bundles![0].code.length).toBeGreaterThan(0);

  // Observe a second bundle.
  const second = lastValueFrom(observable.pipe(take(1)));

  // Touch.
  const now = Date.now().toString();
  await fs.utimes(path.join(actorDir, `${ACTOR_SRC_PRIMARY_NAME}.tsx`), now, now);

  await expect(second).resolves.toBeDefined();
}, 100_000);
