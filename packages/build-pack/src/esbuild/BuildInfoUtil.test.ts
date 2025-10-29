import { newBuildInfoDependencies } from './BuildInfoUtil.js';

test('BuildInfoUtil collects info on Node.js', () => {
  const buildInfo = newBuildInfoDependencies(process.cwd());
  expect(buildInfo.node).toBeDefined();
  expect(Number.parseInt(buildInfo.node.split('.')[0], 10)).toBeGreaterThanOrEqual(18);
});

test('BuildInfoUtil collects info on @devvit/protos, @devvit/public-api, and @devvit/payments', () => {
  const buildInfo = newBuildInfoDependencies(process.cwd());
  expect(buildInfo['node']).toBeDefined();
  expect(buildInfo['@devvit/protos']).toBeDefined();
  expect(buildInfo['@devvit/client']).toBeDefined();
  expect(buildInfo['@devvit/server']).toBeDefined();
  expect(buildInfo['@devvit/public-api']).toBeDefined();
  expect(buildInfo['@devvit/payments']).toBeDefined();
  expect(Number.parseInt(buildInfo['node'].split('.')[0], 10)).toBeGreaterThanOrEqual(0);
  expect(Number.parseInt(buildInfo['@devvit/protos'].split('.')[0], 10)).toBeGreaterThanOrEqual(0);
  expect(Number.parseInt(buildInfo['@devvit/public-api'].split('.')[0], 10)).toBeGreaterThanOrEqual(
    0
  );
  expect(Number.parseInt(buildInfo['@devvit/payments'].split('.')[0], 10)).toBeGreaterThanOrEqual(
    0
  );
});
