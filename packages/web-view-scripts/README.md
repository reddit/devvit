# @devvit/web-view-scripts

Intended for use exclusively in web view apps for code that is shipped on CDN or planned to be shipped on CDN. The mechanism works by injecting a script tag into any HTML files at web view asset upload time:

```html
<script
  src="https://webview.devvit.net/scripts/devvit.v1.min.js"
  data-client-version="1.2.3"
></script>
```

This code is not bundled with an app. It's always downloaded.

The entire dist/scripts directory is uploaded on merge.

## Development

### Local

See [tools/wvs.html](tools/wvs.html).

### Prod

Choose one of the following approaches.

#### Disable `<script>` Injection

Add `@devvit/web-view-scripts` to your client entrypoint before any other code executes. Eg:

```ts
// src/client/index.ts

import '@devvit/web-view-scripts/scripts/devvit.v1.min.js';

import { context } from '@devvit/web/client';
```

Now playtest without script injection:

```
$ cd devvit
$ yarn build
$ cd ~/some-test-app
$ npm link --save ~/work/reddit/src/devvit/packages/{devvit,public-api,web,web-view-scripts}
$ DEVVIT_SKIP_WEB_VIEW_SCRIPT_INJECTION=1 npx devvit playtest r/some-test-sub
```

#### Override Chrome Content

1. Override content in Chrome by right-clicking the `devvit.v1.min.js` request in DevTools -> Network and selecting Override content.
   ![Chrome screenshot showing the `devvit.v1.min.js` network request being right-clicked.](docs/override-content.png)
2. You'll be prompted for a folder. This is where local edits will be saved. Eg, `~/tmp/chrome-overrides`.
3. Bundle the scripts with `yarn workspace @devvit/web-view-scripts build:devvit`.
4. Copy the `packages/web-view-scripts/dist/scripts/devvit.v1.min.js` contents to and paste it into Chrome.
   ![Chrome screenshot showing the `devvit.v1.min.js` overridden content being edited.](docs/edit-content.png)
5. Reload the page. A purple dot indicates the content has been overridden.

Repeat steps 3-4 or make a hard link like ` ln ../../../../work/reddit/src/devvit/packages/web-view-scripts/dist/scripts/devvit.v1.min.js devvit.v1.min.js\?` (symlinks don't seem to work).

#### Test Error Reporting

1. Temporarily set Sentry's `sampleRate` to `1` in `src/errors.v1.ts`, rebuild, and update the Chrome override for `devvit.v1.min.js`.
2. Reload a production web view and trigger an uncaught exception or an unhandled promise rejection. The first runtime error per page load loads the reporter, and Sentry then samples whether to send it. Later errors are ignored, including when the first error is sampled out or the reporter fails to load or send.
3. Override the resulting `errors.v1.min.js` request with the matching file under `packages/web-view-scripts/dist/scripts`, reload, and trigger the error again.
4. Verify that a POST to `https://error-tracking.reddit.com/devvit/api/devvit-app/envelope/` succeeds without CSP or CORS violations. Error Tracking is not supported in Snoodev.
5. Restore `sampleRate` to `1 / 10_000` before committing.
