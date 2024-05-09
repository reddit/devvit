import { Devvit } from '@devvit/public-api';

export enum Step {
  home,
  setup,
}

export function findBorderColor(customColor: string, step: Step): string {
  let borderColor = customColor;
  if (customColor === '#FFE338') {
    if (step === Step.setup) {
      borderColor = 'red';
    }
  }
  return borderColor;
}

export function findUrl(imgUrl: string, customColor: string): string {
  if (imgUrl !== 'doot.png') {
    return imgUrl;
  }
  let newUrl = 'doot.png';
  if (customColor !== '#FFE338') {
    newUrl = 'downdoot.png';
  }
  return newUrl;
}

export function findText(
  step: Step,
  customColor: string,
  imgUrl: string,
  bodyTextCopy: string,
  username: string
): string {
  let text = `In your app project main.tsx file, find the line:\n\n let customColor = "#FFE338";\n\n Replace "#FFE338" with "pink", "#FF69B4" or another color you love.\n\n Save your work and reload this page after you make an update.`;
  if (
    bodyTextCopy !==
    `Hi ${username}! I'm Doot, your Devvit debugging buddy. Let's make some simple code changes as we playtest this app.`
  ) {
    return bodyTextCopy;
  }
  if (customColor !== '#FFE338') {
    if (imgUrl !== 'doot.png' && imgUrl !== 'downdoot.png') {
      text = `Almost done! In main.tsx, find the line that starts with:\n\n  let bodyTextCopy = \n\n Replace Doot's intro with your own. From here, you can clean up the code, add more images, stacks, buttons... make it your own!\n`;
      return text;
    }
    text = `Add new image .png, .jpeg, or .gif file to the "assets" folder. Then, in main.tsx find:\n\n let imgUrl = "doot.png"\n\n Replace "doot.png" with your new file name. You can use the "logo.png" image if you don't have your own handy. Save and refresh the page!`;
    return text;
  }
  if (step === Step.home) {
    return bodyTextCopy;
  }
  return text;
}
