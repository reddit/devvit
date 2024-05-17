import { Devvit } from '@devvit/public-api';

/*
This file contains logic that updates the post UI during the tutorial.
As variables are updated, these functions return content for the next step. 
Once the tutorial is over, this file can be deleted without breaking core functionality.
Make sure to delete the "temporary" section in main if you remove this file.
*/

export enum Step {
  Home,
  Setup,
}

export type InstructionsProps = {
  step: Step;
  customColor: string;
  imgUrl: string;
  bodyText: JSX.Element;
  bodyTextCopy: string;
  username: string;
};

export function findBorderColor(customColor: string, step: Step): string {
  let borderColor = customColor;
  if (customColor === '#FFE338') {
    if (step === Step.Setup) {
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

export const Instructions: Devvit.BlockComponent<InstructionsProps> = ({
  step,
  customColor,
  imgUrl,
  bodyText,
  username,
  bodyTextCopy,
}) => {
  let text = (
    <vstack maxWidth={'50%'} gap="small">
      <text size="medium" wrap>
        1. In main.tsx, find the line:
      </text>
      <zstack width={'100%'}>
        <hstack
          border="thin"
          backgroundColor="#fffee0"
          borderColor="black"
          padding="small"
          cornerRadius="small"
        >
          <text size="medium" weight="bold" color="#800080" selectable={false}>
            const
          </text>
          <hstack width={'4px'} />
          <text size="medium" color="#023E8A" weight="bold" selectable={false}>
            customColor
          </text>
          <hstack width={'4px'} />
          <text size="medium" weight="bold" color="#006400" selectable={false}>
            =
          </text>
          <hstack width={'4px'} />
          <text size="medium" weight="bold" color="#008000" selectable={false}>
            "#FFE338"
          </text>
        </hstack>
        <hstack padding="small" cornerRadius="small" width="100%" height="100%" grow>
          <text size="medium" alignment="middle center" weight="bold" grow color="transparent">
            const customColor = "#FFE338"
          </text>
        </hstack>
      </zstack>
      <text size="medium" wrap>
        2. Replace "#FFE338" with "pink" or another color
      </text>
      <text size="medium" wrap>
        3. Save your work to rebuild the app
      </text>
      <text size="medium" wrap>
        4. Refresh this page!
      </text>
    </vstack>
  );
  if (
    bodyTextCopy !==
    `Hi ${username}! I'm Doot, your Devvit debugging buddy.\n\nLet's make some simple code changes as we playtest this app.`
  ) {
    return bodyText;
  }
  if (customColor !== '#FFE338') {
    if (imgUrl !== 'doot.png' && imgUrl !== 'downdoot.png') {
      text = (
        <vstack maxWidth={'50%'} gap="small">
          <text size="medium" wrap>
            1. In main.tsx, find the line that starts with:
          </text>
          <zstack>
            <hstack
              border="thin"
              backgroundColor="#fffee0"
              borderColor="black"
              padding="small"
              cornerRadius="small"
            >
              <text size="medium" weight="bold" color="#800080" selectable={false}>
                const
              </text>
              <hstack width={'4px'} />
              <text size="medium" color="#023E8A" weight="bold" selectable={false}>
                bodyTextCopy
              </text>
              <hstack width={'4px'} />
              <text size="medium" weight="bold" color="#006400" selectable={false}>
                =
              </text>
            </hstack>
            <hstack padding="small" cornerRadius="small" width="100%" height="100%" grow>
              <text size="medium" alignment="middle center" weight="bold" grow color="transparent">
                const bodyTextCopy =
              </text>
            </hstack>
          </zstack>
          <text size="medium" wrap>
            2. Replace Doot's intro with your own
          </text>
          <text size="medium" wrap>
            3. Add any additional images, buttons, pages, etc
          </text>
          <hstack gap="small" width={'100%'}>
            <text size="medium" wrap>
              4. Share to Devvit using the mod menu button!
            </text>
            <icon size="small" name="mod"></icon>
          </hstack>
        </vstack>
      );
      return text;
    }
    text = (
      <vstack maxWidth={'50%'} gap="small">
        <text size="medium" wrap>
          1. Add a new image.png file to the "assets" folder
        </text>
        <text size="medium" wrap>
          2. In main.tsx, find the line:
        </text>
        <zstack>
          <hstack
            border="thin"
            backgroundColor="#fffee0"
            borderColor="black"
            padding="small"
            cornerRadius="small"
          >
            <text size="medium" weight="bold" color="#800080" selectable={false}>
              let
            </text>
            <hstack width={'4px'} />
            <text size="medium" color="#023E8A" weight="bold" selectable={false}>
              imgUrl
            </text>
            <hstack width={'4px'} />
            <text size="medium" weight="bold" color="#006400" selectable={false}>
              =
            </text>
            <hstack width={'4px'} />
            <text size="medium" weight="bold" color="#008000" selectable={false}>
              "doot.png"
            </text>
          </hstack>
          <hstack padding="small" cornerRadius="small" width="100%" height="100%" grow>
            <text size="medium" alignment="middle center" weight="bold" grow color="transparent">
              let imgUrl = "doot.png"
            </text>
          </hstack>
        </zstack>
        <text size="medium" wrap>
          3. Replace "doot.png" with your file name or "logo.png"
        </text>
        <text size="medium" wrap>
          4. Save, build, refresh!
        </text>
      </vstack>
    );
    return text;
  }
  if (step === Step.Home) {
    return bodyText;
  }
  return text;
};
