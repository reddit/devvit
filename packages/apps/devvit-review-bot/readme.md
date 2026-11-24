# devvit-review-bot

A headless moderator app for `r/devvit_review`. Every minute it checks the latest
100 posts and removes any by non-mods (app has been uninstalled) or those older
than the configured maximum age. It also unmods accounts whose moderator tenure
exceeds that age, except for protected accounts.

Set `max-age-ms` in the app's subreddit settings to change the maximum age in
milliseconds (default: `1800000`, 30 minutes). The value must be greater than zero.
Posts by non-moderators are always removed immediately.

Run `devvit settings set mod-allowlist` to configure a comma-separated list
of moderator usernames that should never be unmodded. This setting applies to
all installations of the app.

## Commands

- `npm run playtest [r/sub]`: watches changes, builds, uploads, and installs on Reddit. Accepts an optional subreddit.
- `npm run build`: builds the server.
- `npm run clean`: removes build outputs.
- `npm run test`: runs type checks, lint, unit tests, and the build.
- `npm run format`: fixes lints and formatting.
- `npm run lint`: checks lints and formatting.
- `npm run publish`: cleans, builds, uploads, and files a new app review request.
