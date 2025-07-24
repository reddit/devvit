/**
 * Hey! If you're seeing this, you're probably trying to run server code in the
 * client context, or you have your client build environment set up incorrectly.
 * To fix this:
 * 1) Check that you're not importing server code in your client files. If you
 *    are, you should import from `@devvit/web/client` instead of
 *    `@devvit/web/server`.
 * 2) Ensure that your client's tsconfig & build environment is set up correctly
 *    - specifically, make sure you set `compilerOptions.customConditions` to
 *    `["browser"]` in your `tsconfig.json` file. Also, verify that whatever
 *    bundler you're using (esbuild, vite, etc.) is bundling the client code
 *    for a web browser, and not a Node environment!
 */

console.error("Can't import server code in the client!");
