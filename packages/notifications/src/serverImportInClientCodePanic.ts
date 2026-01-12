/**
 * Hey! If you're seeing this, you're probably trying to run server code in the
 * client context, or you have your server build environment set up incorrectly.
 * To fix this:
 * 1) Check that you're not importing server code in your client files. If you
 *    are, you should import from `@devvit/web/client` instead of
 *    `@devvit/web/server`. `@devvit/pushnotif` is server only and has no client
 *    support.
 * 2) If this is coming from server code, ensure that your client's tsconfig &
 *    build environment is set up correctly - specifically, make sure you do NOT
 *    have `compilerOptions.customConditions` set to include `["browser"]` in
 *    your `tsconfig.json` file. Also, verify that whatever bundler you're using
 *    (esbuild, vite, etc.) is bundling the client code for a Node environment,
 *    and not a web browser!
 */

console.error("Can't import server code in the client!");
