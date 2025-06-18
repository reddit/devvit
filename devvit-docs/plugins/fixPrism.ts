import { LoadContext, Plugin } from '@docusaurus/types';

/**
 * There is a problem inside of redocusaurus that causes prism to not be
 * properly injected into the page. This plugin fixes that.
 */
export default function fixPrismPlugin(context: LoadContext): Plugin {
  return {
    name: 'fix-prism',
    // Docusaurus passes a 3rd `currentBundler` param when using the modern
    // faster pipeline. We preferentially pick its `ProvidePlugin` to remain
    // agnostic, and fall back to the classic `webpack` one.
    configureWebpack(_config, _isServer, { currentBundler }) {
      return {
        plugins: [
          new currentBundler.instance.ProvidePlugin({
            Prism: ['prismjs'],
          }),
        ],
      };
    },
  };
}
