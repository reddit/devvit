import inquirer from 'inquirer';
import open from 'open';

import { localCodeServer } from '../lib/auth/local-code-server.js';
import { DEVVIT_PORTAL_URL } from './config.js';
import { readLine } from './input-util.js';

export type GetCaptchaOptions = {
  copyPaste: boolean;
};
export async function getCaptcha({ copyPaste }: GetCaptchaOptions): Promise<string> {
  if (copyPaste) {
    return getCaptchaViaCopyPaste();
  } else {
    return getCaptchaViaLocalhost();
  }
}

async function getCaptchaViaCopyPaste(): Promise<string> {
  const captchaUrl = `${DEVVIT_PORTAL_URL}/cli-captcha?copyPaste=true`;
  console.log(
    "In order to create your app, you'll need to prove you're not a robot. Please go to:\n" +
      `${captchaUrl}\n` +
      'Once there, complete the humanity check, and copy-paste the token it gives you here.\n'
  );

  let tokenOrEnter = '';
  while (tokenOrEnter === '') {
    tokenOrEnter = (
      await inquirer.prompt([
        {
          name: 'tokenOrEnter',
          type: 'input',
          message:
            'Press enter to open the captcha page in your browser, or just paste the token in:',
        },
      ])
    ).tokenOrEnter;
    if (tokenOrEnter === '') {
      try {
        await open(captchaUrl);
      } catch {
        console.error(
          `An error occurred when opening the captcha page. Please do it manually by going to:\n${captchaUrl}`
        );
      }
    }
  }

  return tokenOrEnter;
}

function getCaptchaViaLocalhost(): Promise<string> {
  return localCodeServer({
    serverListeningCallback: ({ port, state }) => {
      const captchaUrl = `${DEVVIT_PORTAL_URL}/cli-captcha?callbackPort=${port}&state=${state}`;
      console.log(
        "In order to create your app, you'll need to prove you're not a robot. Please go to:\n\n" +
          `${captchaUrl}\n\n` +
          `Once there, complete the humanity check, and then come back here.\n` +
          'Press enter to open this link immediately to complete authentication:'
      );
      // Don't await. Start the server immediately, so we don't miss a callback.
      const line = readLine();
      line.then(() => open(captchaUrl)).catch(() => {});
    },
    requestHandler: async (queryParams) => {
      if (!queryParams.token) {
        return false;
      }
      const queryToken = queryParams.token;
      return typeof queryToken === 'string' ? queryToken : queryToken[0];
    },
  });
}
