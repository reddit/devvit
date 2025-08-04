import type http from 'node:http';
import util from 'node:util';

import { StringUtil } from '@devvit/shared-types/StringUtil.js';

/**
 * Helper module to generate html for the login commands local http server
 */

const pageShell = (body: string): string => `
<html class="no-js" lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title></title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {

            background: #F6F8F9;

        }

        .container {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .success-msg {
            color: #181C1F;
            font-family: sans-serif;
            text-align: center;
        }
        .fail-msg {
            color: #181C1F;
            font-family: sans-serif;
            text-align: center;
        }


        .close-window-msg {
            color: #333D42;
            font-size: 16px;
            letter-spacing: 0.03em;
        }
        .error-detail {
            color: #333D42;
            font-size: 16px;
            letter-spacing: 0.03em;
        }

        .snoo-logo {
            margin-top: 10vh;
            text-align: center;
            max-height: 50vh;
        }

        .party-k8s {
            display: block;
            margin-left: auto;
            margin-right: auto;
            vertical-align: middle;
            top: 60px;
            left: 1950px;
            width: 70px;
            height: auto;
        }
    </style>
  </head>
  <body>
    <div class="container">
      ${body}
    </div>
  </body>
</html>
`;

export const loginSuccess = (): string =>
  pageShell(`
<div class="success-msg">
    <h1 style="margin-bottom: 8px;">You're all set!</h1>
    <span class="close-window-msg">
      Continue in your terminal.
      <br />
      <br />
      You can close this tab.
    </span>
  </div>
`);

export const errorPage = (errorMessage: string, extra?: string): string =>
  pageShell(`
<div class="fail-msg">
    <h1 style="margin-bottom: 8px;">Failed to fetch credentials</h1>
    <span class="error-detail">${errorMessage}</span>
    ${extra ? `<div class="error-detail">${extra}</div>` : ''}
</div>
`);

export function handleError(res: http.ServerResponse, err: unknown): void {
  console.error(StringUtil.caughtToString(err));
  res.writeHead(500, { 'Content-Type': 'text/html' });

  res.write(
    errorPage(
      `An unknown error occurred ${
        err && typeof err === 'object' && 'statusCode' in err
          ? `(status code: ${err.statusCode})`
          : ''
      }.
      Details on the error have been logged below.`,
      `Depending on the type of error, trying again might help.
      <br /><br />
      <pre><code>${util.inspect(err)}</code></pre>
      `
    )
  );

  res.end();
}

// If access was denied, print a message asking them to try again and approve access
export function handleAccessDenied(res: http.ServerResponse, authenticationUrl: string): void {
  res.writeHead(400, { 'Content-Type': 'text/html' });
  res.write(
    errorPage(
      'In order to login to Devvit, you will need to click "allow" at the reddit authentication screen.',
      `To try again, click <a href="${authenticationUrl}">here</a>`
    )
  );
  res.end();
}
