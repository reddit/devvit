# AI Tools

Devvit ships with first class support for common AI tools and patterns.

## LLMs.txt files

- https://developers.reddit.com/docs/llms.txt: Most useful for pasting into the chat UI of common LLMs BEFORE your prompt. Place your prompt last as models are auto-regressive.
- https://developers.reddit.com/docs/llms-full.txt: Useful for pasting into the chat UI of LLMs with large context windows (Gemini, Claude Sonnet 4). This lets you chat with the docs instead of reading them. It's easy to pollute your context if your using this for coding so we recommend only using this to learn about Devvit or plan. To execute, use `llms.txt` as most modern LLMs can tool call websites.

## Cursor Support

The React, ThreeJS, and Phaser templates ship with support for cursor rules out of the box. We've found these helps Cursor output high quality code for Devvit. Feel free to add and remove them as you see fit.

## MCP

Devvit ships with a MCP server to assist with agent driven development. There are two commands at the moment:

- `devvit_search`: Executes hybrid search over all of our docs. This is preferable to pasting in tons of docs since it can be more specific and lowers the risk of polluting your context.
- `devvit_logs` [experimental]: Queries for logs of your app and a subreddit to place into an agent's context. It can be fun any useful, and shows a glimpse of the future of AI Devvit! Try this after MCP is turned on in your agent, "find a bug in my app deployed to the subreddit <YOUR_SUBREDDIT_NAME> from the past week and a fix it". It might not work, but when it does, magic!

### Cursor

> Note that React, ThreeJS, and Phaser ship with first class support. All you have to do is run a template from [/new](https://developers.reddit.com/new) in cursor and you will see a popup at the bottom-left corner to enable.

1.  In your project, ensure a `.cursor` directory exists at the root. Create it if necessary.
2.  Inside `.cursor`, create or open the `mcp.json` file.
3.  Paste the following configuration into `mcp.json`:

    ```json
    {
      "mcpServers": {
        "devvit": {
          "command": "npx",
          "args": ["-y", "@devvit/mcp"]
        }
      }
    }
    ```

4.  Save the file.
5.  Check [Cursor](https://www.cursor.com/)'s **Settings/MCP** section. The Devvit MCP server should show an active status (green indicator). You might need to click "Refresh" if it doesn't appear immediately.

### Claude Code

```sh
claude mcp add devvit -- npx -y @devvit/mcp
```

Things should work after that!

### Claude Desktop

1.  Open the [Claude desktop](https://claude.ai/download) application and go to **Settings**.
2.  Navigate to the **Developer** tab and click **Edit Config**.
3.  Add the Devvit server configuration:

```json
{
  "mcpServers": {
    "devvit": {
      "command": "npx",
      "args": ["-y", "@devvit/mcp"]
    }
  }
}
```

4.  Save the configuration file and restart the Claude desktop application.
5.  When starting a new chat, look for the MCP icon (hammer); the Devvit server should now be listed as available.

### Visual Studio Code (Copilot)

1.  Ensure your project root contains a `.vscode` directory. Create one if it's missing.
2.  Create or open the `mcp.json` file within the `.vscode` directory.
3.  Insert the following configuration:

    ```json
    {
      "servers": {
        "devvit": {
          "command": "npx",
          "args": ["-y", "@devvit/mcp"]
        }
      }
    }
    ```

4.  Save `mcp.json`.
5.  In the Copilot chat panel within [Visual Studio Code](https://code.visualstudio.com/), ensure you're in "Agent" mode. The tool icon should now indicate that Devvit MCP tools are available for use.

Refer to the [official Copilot documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) for further details on VS Code MCP integration.

### Testing the Connection

With your AI tool configured, you should now be able to leverage the Devvit MCP server. A good way to test this is to ask your AI assistant a question that requires accessing Devvit resources, for example: "Search the Devvit docs for information on redis."

If you encounter problems, refer to the official Devvit documentation or reach out in the [Discord](https://discord.com/invite/R7yu2wh9Qz).
