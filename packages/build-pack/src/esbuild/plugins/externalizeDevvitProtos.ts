import type { OnResolveArgs, OnResolveResult, Plugin, PluginBuild } from 'esbuild';

/**
 * Plugin for externalizing `@devvit/protos` imports from the bundle. This is done as a plugin rather than using
 * the `external` option in the build config to ensure we only externalize the root of the @devvit/protos package.
 * Other imports like @devvit/protos/payments.js will still be bundled.
 *
 * @param disableExternDevvitProtos -- If true, the plugin will not externalize @devvit/protos.
 * @returns
 */
export function externalizeDevvitProtos(disableExternDevvitProtos: boolean): Plugin {
  return {
    name: 'externalizeDevvitProtos',
    setup(build: PluginBuild) {
      if (!disableExternDevvitProtos) {
        build.onResolve(
          { filter: /^@devvit\/protos$/, namespace: 'file' },
          (args: OnResolveArgs): OnResolveResult => {
            return {
              path: args.path,
              external: true,
            };
          }
        );
      }
    },
  };
}
