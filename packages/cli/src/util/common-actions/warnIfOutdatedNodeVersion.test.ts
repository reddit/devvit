import { TargetRuntime } from '@devvit/protos/json/devvit/runtime/bundle.js';
// eslint-disable-next-line no-restricted-imports
import type { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import { describe, expect, it, test, vi } from 'vitest';

import { MIN_RECOMMENDED_NODE_MAJOR } from '../../constants/Environment.js';
import type { DevvitCommand } from '../commands/DevvitCommand.js';
import {
  isNodeVersionOutdated,
  nodeVersionWarning,
  warnIfOutdatedNodeVersion,
} from './warnIfOutdatedNodeVersion.js';

function makeBundle(targetRuntime: TargetRuntime, nodeVersion: string | undefined): Bundle {
  return {
    buildInfo: {
      targetRuntime,
      dependencies: nodeVersion == null ? {} : { node: nodeVersion },
    },
  } as unknown as Bundle;
}

function makeCommand(): { command: DevvitCommand; warn: ReturnType<typeof vi.fn> } {
  const warn = vi.fn();
  const command = { warn } as unknown as DevvitCommand;
  return { command, warn };
}

describe('isNodeVersionOutdated', () => {
  test.each([
    ['22.1.0', true],
    ['20.5.0', true],
    ['v18.0.0', true],
    ['23.9.9', true],
    ['24.0.0', false],
    ['v24.1.0', false],
    ['25.0.0', false],
    ['', false],
    ['garbage', false],
  ])('%s -> %s', (nodeVersion, expected) => {
    expect(isNodeVersionOutdated(nodeVersion)).toBe(expected);
  });

  test('boundary matches MIN_RECOMMENDED_NODE_MAJOR', () => {
    expect(isNodeVersionOutdated(`${MIN_RECOMMENDED_NODE_MAJOR - 1}.99.99`)).toBe(true);
    expect(isNodeVersionOutdated(`${MIN_RECOMMENDED_NODE_MAJOR}.0.0`)).toBe(false);
  });
});

describe('nodeVersionWarning', () => {
  test('includes the version and recommended major', () => {
    const warning = nodeVersionWarning('22.1.0');
    expect(warning).toContain('22.1.0');
    expect(warning).toContain(String(MIN_RECOMMENDED_NODE_MAJOR));
  });
});

describe('warnIfOutdatedNodeVersion', () => {
  it('warns when the universal bundle was built with an old Node.js', () => {
    const { command, warn } = makeCommand();
    warnIfOutdatedNodeVersion(command, [makeBundle(TargetRuntime.UNIVERSAL, '22.1.0')]);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('22.1.0');
  });

  it('does not warn when the Node.js version is supported', () => {
    const { command, warn } = makeCommand();
    warnIfOutdatedNodeVersion(command, [makeBundle(TargetRuntime.UNIVERSAL, '24.0.0')]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn when there is no universal bundle', () => {
    const { command, warn } = makeCommand();
    warnIfOutdatedNodeVersion(command, [makeBundle(TargetRuntime.CLIENT, '22.1.0')]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn when the Node.js version is missing', () => {
    const { command, warn } = makeCommand();
    warnIfOutdatedNodeVersion(command, [makeBundle(TargetRuntime.UNIVERSAL, undefined)]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('does nothing for an empty bundle list', () => {
    const { command, warn } = makeCommand();
    warnIfOutdatedNodeVersion(command, []);
    expect(warn).not.toHaveBeenCalled();
  });
});
