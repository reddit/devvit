# Devvit Web configuration

## `devvit.json`

`devvit.json` is the configuration file for Devvit apps. It defines an app's post configuration, Node.js server configuration, permissions, scheduled jobs, event triggers, menu entries, payments configuration, and project settings. `devvit.json` replaces the legacy `devvit.yaml` configuration. A project should have one or the other but not both.

The `devvit.json` schema is available at [https://developers.reddit.com/schema/config-file.v1.json](https://developers.reddit.com/schema/config-file.v1.json) and is self-documented.

All configuration files should include a `$schema` property which many IDEs will use to make suggestions and present documentation:

```json
{
  "$schema": "https://developers.reddit.com/schema/config-file.v1.json"
}
```

### Migration from `devvit.yaml`

1. Create a new `devvit.json` file in the project root.
2. Copy over the `name` property from `devvit.yaml`.
3. Delete `devvit.yaml`.
4. Move configuration from `Devvit.configure()` calls to `permissions`. For example, if the app called `Devvit.configure({redis: true})` set `permissions.redis` to `true` in `devvit.json`.
5. If the app has a web view, set `post` in `devvit.json` and either configure `post.entry` to `webroot/` or rename `webroot/` to `src/client/`. Optionally, delete calls to `Devvit.addCustomPostType()` and `Devvit.addMenuItem()`.
6. If the app has a Node.js server, set `server` in `devvit.json`.
7. (Optional) Set `blocks.entry` to `src/main.tsx` (or `src.main.ts`) to continue using `@devvit/public-api` legacy APIs. `export default Devvit` is no longer necessary.

### Troubleshooting

The `devvit.json` configuration is validated against the JSON Schema at build time. Many IDEs will also underline errors as you write. Common validation errors include:

- Adding a comment (unsupported by JSON). JSON does not support comments.
- Adding a trailing comma (unsupported by JSON).
- Missing the required `name` property.
- Missing at least one of the `post` or `server` properties.
- Missing files referenced explicitly or implicitly in `devvit.json`.
- Missing permissions.

## Best practices

1. **Always include the `$schema` property** for IDE autocompletion and validation.
2. **Use specific permission scopes.** Only request permissions an app actually uses.
3. **Set appropriate menu scopes.** Consider whether features should be available to all users or just moderators.

## Environment variables

- `DEVVIT_SUBREDDIT`: Override the `devvit.json` development subreddit used during `devvit playtest`.
