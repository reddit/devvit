/**
 * Hey! If you're seeing this, you're probably trying to run client code in the
 * server context, or you have your client build environment set up incorrectly.
 * To fix this:
 * 1) Check that you're not importing client code in your server files. If you
 *    are, you should import from `@devvit/payments/server` instead of
 *    `@devvit/payments/client`.
 * 2) If this is coming from client code, ensure that your server's tsconfig &
 *    build environment is set up correctly - specifically, make sure you set
 *    `compilerOptions.customConditions` to `["browser"]` in your `tsconfig.json`
 *    file. Also, verify that whatever bundler you're using (esbuild, vite, etc.)
 *    is bundling the server code for a web browser, and not a Node environment!
 */

console.error("Can't import client code in the server!");
