# Create an app

Learn how to build an app.

To create a new app run the new command.

```bash
$ devvit new
```

You will be prompted for a project name. The project name is used as your folder name and must be six or more characters, all lowercase, can't start with numerals and include only a-z, 0-9 or '-'. We recommend [Kebab case](https://developer.mozilla.org/en-US/docs/Glossary/Kebab_case) names.

Create your app from scratch or use a [project template](#templates) to start with functioning code examples.

You can also pass the project name directly as an attribute.

```bash
$ devvit new <project-name>
```

You now have a full directory with your project name. There are several files and folders in this directory. The `src/main.tsx` file contains the main code for your app.

```text
my-project
├── devvit.yaml
├── package.json
├── src
│   └── main.tsx
├── tsconfig.json
```

## Project templates

To create an app based on a project template, use the `--template` flag to create a new project. The following example creates an app based on the `custom-post` template.

```bash
$ devvit new --template custom-post
```

You can set the project name and use the template flag at the same time.

```bash
$ devvit new --template custom-post <project-name>
```

### Templates

| Template       | Description                                               |
| -------------- | --------------------------------------------------------- |
| `blocks-post`  | An interatcive post template using Devvit blocks.         |
| `webview-post` | An interatcive post template using the webview comopnent. |
| `empty`        | The default, boilerplate project template.                |
