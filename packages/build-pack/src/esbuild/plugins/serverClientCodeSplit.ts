import path from 'node:path';

import { CircuitBreak } from '@devvit/shared-types/CircuitBreaker.js';
import type {
  OnLoadArgs,
  OnLoadResult,
  OnResolveArgs,
  OnResolveResult,
  Plugin,
  PluginBuild,
} from 'esbuild';

// Code stamped in client builds that replaces server-only code as `server-stub.js`
const CLIENT_CIRCUITBREAK_STUB = `
  let circuitBreak = globalThis.circuitBreak;
  if (!circuitBreak) {
    ${CircuitBreak}
    circuitBreak = (method) => {
      throw CircuitBreak(method);
    };
  }
  const trap = () => { circuitBreak(); };
  module.exports = new Proxy(function() {}, {
    has: () => true,
    get: () => {
      return new Proxy(function() {}, {
        has: () => true,
        get: trap,
        apply: trap,
        construct: () => new Proxy({}, {
          has: () => true,
          get: trap,
          apply: trap,
        }),
      });
    },
    apply: trap,
    construct: trap,
  });
`;

// onResolve namespace to flag when a file should be replaced with the circuit break stub
const SERVER_ONLY_NAMESPACE = 'server-only';

// Dedup stamps on published builds by renaming the import on resolve
const SERVER_ONLY_FILENAME = 'server-stub.js';

/**
 * Replaces imports that always result in client-side circuit break exceptions with a
 * code stub that just throws the CircuitBreak exception instead of including all of the
 * code that will never execute on the client.
 */
export function serverClientCodeSplit(watchMode: boolean = false): Plugin {
  return {
    name: 'removeServerCode',
    setup(build: PluginBuild) {
      // Remove code the developer has marked as server-only by naming convention:
      build.onResolve(
        { filter: /(\/server\/)|(\.server\.(js|ts)x?$)/ },
        async (args: OnResolveArgs): Promise<OnResolveResult> => {
          // prevent an infinite loop when calling resolve from within onResolve
          if (args.pluginData) {
            return {};
          }

          // Only the local project code should be stubbed
          if (args.path.includes('node_modules')) {
            return {};
          }

          if (!watchMode) {
            return {
              namespace: SERVER_ONLY_NAMESPACE,
              path: SERVER_ONLY_FILENAME,
            };
          }

          // Resolve actual path but mark it with the server-only namespace.
          const resolved = await build.resolve(args.path, {
            kind: args.kind,
            resolveDir: args.resolveDir,
            importer: args.importer,
            with: args.with,
            pluginData: true,
          });
          // clean up the paths so we don't stamp local paths in the final output
          resolved.path = path.relative(process.cwd(), resolved.path);
          resolved.namespace = SERVER_ONLY_NAMESPACE;
          return resolved;
        }
      );

      // Create the circuit break stub and return a Proxy object so any
      // fields or functions imported throw a CircuitBreak exception instead
      // of a ReferenceError.
      build.onLoad(
        { filter: /.*/, namespace: SERVER_ONLY_NAMESPACE },
        async (args: OnLoadArgs): Promise<OnLoadResult> => {
          return { contents: CLIENT_CIRCUITBREAK_STUB, loader: 'js', watchFiles: [args.path] };
        }
      );
    },
  };
}

/**
 * Hacky solution to ensure our stub is treated as the `module.exports` object and is not
 * shimmed into the ESM `default` slot by ESBuild.
 * @param code
 */
export function postProcessServerStubCode(code: string): string {
  return Array.from(
    code.matchAll(/var require_([a-zA-Z_-]+) = __commonJS\(\{\n[^\n]*"server-only:/gm)
  ).reduce(
    (code, [_, stub]) => code.replaceAll(`__toESM(require_${stub}(), 1)`, `require_${stub}()`),
    code
  );
}
