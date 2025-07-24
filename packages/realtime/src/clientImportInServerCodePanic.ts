/**
 * Hey! If you're seeing this, you're probably trying to run client code in the
 * server context, or you have your server build environment set up incorrectly.
 * To fix this:
 * 1) Check that you're not importing client code in your server files. If you
 *    are, you should import from `@devvit/web/server` instead of
 *    `@devvit/web/client`.
 * 2) Ensure that your server's tsconfig & build environment is set up correctly
 *    - specifically, make sure you do NOT set `compilerOptions.customConditions`
 *    to `["browser"]` in your `tsconfig.json` file. Also, verify that whatever
 *    bundler you're using (esbuild, vite, etc.) is bundling the server code
 *    for a Node environment, and not a web browser!
 */

console.error("Can't import client code in the server!");
