import type { LoadContext, Plugin } from '@docusaurus/types';

export default function customAssetPathPlugin(
  context: LoadContext,
  options: Record<string, unknown>
): Plugin {
  return {
    name: 'custom-asset-path-plugin',
    configureWebpack(config, isServer) {
      // Only modify client build, not server build
      if (isServer) {
        return {};
      }

      // Modify MiniCssExtractPlugin options directly
      if (config.plugins) {
        config.plugins.forEach((plugin) => {
          if (plugin && plugin.constructor?.name === 'CssExtractRspackPlugin') {
            const pluginWithOptions = plugin as {
              options?: { filename?: string; chunkFilename?: string };
            };
            if (pluginWithOptions.options) {
              pluginWithOptions.options.filename = 'fh-assets/[name].[contenthash:8].css';
              pluginWithOptions.options.chunkFilename = 'fh-assets/[name].[contenthash:8].css';
            }
          }
          // Also check for MiniCssExtractPlugin (webpack fallback)
          if (plugin && plugin.constructor?.name === 'MiniCssExtractPlugin') {
            const pluginWithOptions = plugin as {
              options?: { filename?: string; chunkFilename?: string };
            };
            if (pluginWithOptions.options) {
              pluginWithOptions.options.filename = 'fh-assets/[name].[contenthash:8].css';
              pluginWithOptions.options.chunkFilename = 'fh-assets/[name].[contenthash:8].css';
            }
          }
        });
      }

      return {
        output: {
          // JS bundles
          filename: 'fh-assets/[name].[contenthash:8].js',
          chunkFilename: 'fh-assets/[name].[contenthash:8].js',
          // CSS files (rspack native CSS support)
          cssFilename: 'fh-assets/[name].[contenthash:8].css',
          cssChunkFilename: 'fh-assets/[name].[contenthash:8].css',
          // Other assets (images, fonts, etc.)
          assetModuleFilename: 'fh-assets/[hash][ext][query]',
        },
      };
    },
  };
}
