import type { MenuItemOnPressEvent } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

/*
The first step is to create a post.
This handler makes sure that the post is created and loaded.
The post creator is also saved to redis here, to ensure others can't share the post to our gallery.
*/
export const createPost = async (
  _event: MenuItemOnPressEvent,
  context: Devvit.Context
): Promise<void> => {
  const subreddit = await context.reddit.getCurrentSubreddit();
  const user = await context.reddit.getCurrentUser();
  const username = user?.username ?? 'user';
  /* Save the post creator name.
  Only this user can share the post to the community */
  await context.redis.set('hell0_user', username);
  const newPost = await context.reddit.submitPost({
    title: `Hello ${username}`,
    subredditName: subreddit.name,
    // The preview appears while the post loads
    preview: (
      <vstack height="100%" width="100%" alignment="middle center">
        <text size="large">Loading ...</text>
      </vstack>
    ),
  });
  context.ui.showToast({ text: 'Created post!' });
  context.ui.navigateTo(newPost.url);
};
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
  context: Devvit.Context;
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

/*
Note that devvit text formating capabilities are limited at the moment.
This section will be refactored when we have more formatting options.
*/

export const Instructions: Devvit.BlockComponent<InstructionsProps> = ({
  step,
  customColor,
  imgUrl,
  bodyText,
  username,
  bodyTextCopy,
  context,
}) => {
  let text = (
    <vstack maxWidth={'50%'} gap="small">
      <text color="black" size="medium" wrap>
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
          <text size="medium" color="#33b3a6" weight="bold" selectable={false}>
            : string
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
            const customColor: string = "#FFE338"
          </text>
        </hstack>
      </zstack>
      <text size="medium" color="black" wrap>
        2. Replace "#FFE338" with "pink" or another color
      </text>
      <text size="medium" color="black" wrap>
        3. Save your work to rebuild the app
      </text>
      <text size="medium" color="black" wrap>
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
        <vstack
          maxWidth={'50%'}
          gap="small"
          padding="small"
          border="thick"
          borderColor="#F4BB44"
          backgroundColor="#FFF59d"
          cornerRadius="small"
        >
          <text size="medium" color="black" wrap>
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
          <text color="black" size="medium" wrap>
            2. Replace Doot's intro & make the app your own!
          </text>
          <hstack gap="small">
            <hstack
              cornerRadius="small"
              backgroundColor="#fffee0"
              borderColor="black"
              padding="xsmall"
              onPress={() =>
                context.ui.navigateTo(
                  'https://developers.reddit.com/play#pen/N4IgdghgtgpiBcIQBoQGcBOBjBID0eABADIwQZiFQD2GMhEALoQCYwBuMANtQA4wY0AOjosWAS0ZCs1KHhbUsaADphxUXrWbBCAEQ7tJhAL6EAZhlmFlIAAJt2hxnl4BXAEZdxWALQRe4jYA3Kqq+o6SQhBiAMKuaIyyAArUCQAqAJ78ABTAqoSEkLDw1iBxCVYpCTbI+YQAFjDiAOb1jCU2dM2uXOQ1dXRgbBgl2TJgjDAAHowAlIQAvAB8hHlgdQXjCYRY8YlQMdQ8I4QJGOJgzYulAMQAYncAbACc7gAswRuEBF9cMMzuagsDJpabMBaEbJfAoAHkmM1O4gAXjAFjZehhmjAbIQAO5NVqMNEgQFcFg4mTHYm4+qSbEgKgQKYAdXELEY9QWeRAAGYAAwAUhsplxGH8S2hBVKAEFWAYjDIoFBXGpGBlCM06FAvJRGnRCIkGtxeIQMtRXBr-qcra4TbjJPU5REpIQAJKSgo8TiEAJgADWQhskpheHhjAllClsxCkalhDojFcFEhHqlMPYCQgWD9DC8zTAsAmxKwMAmAhx9vZnO5AEY+YLhYR3Fm-ZrzUNDlTgLsKgcjrRTG3cT7ohJLsS0FAIFwuDYI3GF2m0LwswJESiJ1OZzi8PPFwv05ns7mWgXS0SbCWyxgK2yOVybHWGyBB5ZcXv9wf6kec9PT4WLxAK9JhvEAP0-A91AgLFUwgwgky4B9Yzg-cbDaRheDQeACHEEQYDEIRJDwNAwGoah2CYcg8AgCjGHINA8AADh5FgACZWIgRiYB8AB2N5WJ5Hw3kYmtBOeVieMYnw+VXMxWL5VisEeFh3CEXhLiDZCUKlYxYIgtg0Cwc5eEYcRqDAYleC4et6k07TFygrEAAkCTaB8QEYvleCmYU9M-RyYFZKt3M87zfK0lDdz8g8Mzo48-3zADiSgNkWD+OdosXGFvzinNmn8Tdp1nMDMv3OEwVKz80GRVEbEnIq7Psz98RaNybFJckQEq-dKVoalaUmRqmsXKcWTvatH1CnyX26xdRX8WapXA4apSc8QAEI3QAcigH1rL5WyIqakMw2W4aYW8cz11qkApnq7cGSKG7ohSsAfDMcQHp2fsMH6ukdzO7SQxyltAZQ8qEWqjc6q3YrvqpGwaX+hlRqC+9aymxt5t4MHtNdHaGG+pUVUkdVNRgbULiNfVDUaLgTTNC17Q5XMuANWlLhUI77IcJwhEIABleoyOYWBCdIyZCHEMxTXNQoYHw05bU0DBGHWxaTrBXGyrwWLQe6mFl1XDANTfb5tbjYGfwtwgQz17MbcNlcSxNqGbtgCRXCgAHosPXKNQKmGGpK7msrDeG+sRgb6TxVzAI6nE3eS-DxC9nEErPIs6ro1WMtD-c0j4QhGMFjwueO0MtdK7KfwD3hCoem3Lftv1FsrdGbAAVk7sKZvzz9GlaoluW73vdP7-dAQwYZO0jkAbjMMwaxYRiAFEhuGqfhmJDlvFbrqJ8XZtszbFUWFn36o+RxaZAoAQACVolTtAG+KxaM6SmwUrEP4dnPcsD4rQKOZJIdA0Av2ANkeYyxFqbHMmGIQrhcKQEMPlSYhcoQgHQphbCeBcT4LwmISIio8AYDwLocyfoYAZAYjYWYi1x4rSbpBKcMFD77gQsSbBWECAJAyH8YQogJCMA9uICA0hZChk7gAfVYhQP07BiJqgEXgRUypVQZFdOMaRjEABWGRGJYDeBkCA4hcRvGeDWNSGlAFAIKAFFyQ93JvC8tNRhdipasMCuNZxrjwp2Kiuw2EutrYGxbm3HxI8e5uMWoPQk7lR4xKCVKLeAgL7EgXkvFe69bErVSZfEAu9swbyasfVslgz7pKvoNXJw1b5gAfk-eIr8Sn2Q-ueZKqVf7AQAYtEBYCIFQMWMwxc4wEFIKECgloTAYAYLQowDCPC8EEKEcQyRZDpRpAAEIAHFV54DoQw7qIy0wBVgfBDAiF5mLNwXwgRhDhGiPESQxgMieRmAAI62iUfwmADE1EkzVFo8y0jmi4iwO4LAuiPm4mgjyViVj1LNFaU1BxcdfFj3OQFNGE0QAuMxckgogSVp21CesZJfsWwROClEgldi4luVpUkux+Sqnz0XsvNeKKUL5J3rSYptTSktlPh2H6f0ak31oA0jAj9PYvyDg9d+eZM6AW-mlegPTQJ9LAKAv5gzoEnLjGMsEiDkE0Wmeg6gUJCULmuTggg+DcQPLWXIMhxBzLNDuEmdw4g-kHMFcNehNr3FNUNbbM5NqCicLtUsu5fznUiJTs8yRrzpEYF4FkHiPyVEAo0cCsA0isBImaHyAxuJmgZCwPCqxujeDNAAPxmFoFOIkvBa3NAAGQvzeDWRSjw3hmBgO4atjwuJmDYKxTu7EzB8h5IxHirFDFKUeCWTuPF3DPEeNy7SaKnHcnxcyjx2LIk2APf4oBxLzohNyhGMJP5qUdxAIk89K0GXDy7tEl9m9aAzzFTYTJnKcmLV5TYIp+9gPCoqaKhGIAkYSptfUxpcqWkBu0u0rOIA1XdP-lqm1-S9VciGTAyN30ywzFNZM81aDZlWvOQUGNuDHUJoka66i-Aph-CxEMWhqH7JBrsSG+yYaLpePOdGrBCz7XZvjasxNEhk1yFTZiJESJnBxv+bIdRpN83SNcBkMwjA-QYGHWgLgUx3CIpsVirxjj4n7r8X3DxnjoLeJpaehzgmmqXori3ZhVsb3VxBsefK9cFXFROZS4pNr264ufY5oBb6Emfvi3kn9aS-3sqyVy3jcEQOFP5eBm1ZSRXnwy3B+kkq74yqafK9AsNt0QXQ6qrpGqcMNc-Ph8BhGDXnONeRiZUzqNzJI-RiTNyHUrPwsIljpD5DRDQDSIEbIJawomPwRgPHzn8aAZ5lCwmI1OfE9w25yiZNTckE8mbqakTiEYlAZo0mNPEzzdonkSJ3BIjMICAstJHiWeRTllCu67PubpUerxOKMWHpWt5+ypKAvkpJeE6LJ6n3Jd29pRLTKv2lLSxgNlAHsntcnnjvle9idH0g+2UrMHysU4XIh6ryGwv07jE1zpP9WvXlZ1KTr+rhm9fgSagbVGZlzLG1JpjsmZtkIAHLUGIBAXEYAePbZWhjiC+3RMkaO5J2Np3BHnbk2Iq7MjXCzp4tQR7qjNOAs0doxgLBzh02aJ3R4jwLPWIB9ZlztnGWg+h0A49bm8UecWrDoG179aI-OsjuxMWktg9fei7HKXv3T3SzBwn2XgOk9AwVnnBRitQZp3POngPPyM9lc-FDSr-wdK-i1v+3OK-7j591gXJG+tSBF6gsXtGRulGOxNp10uSFkPUGgWgGAMi6PMv6rbRzkla5c2Jy5XC9cnd+YbohxuFNSOkVZExfpre5u09o+oKnO7iD5M0P0Pbng9q94XqUwP-eh6T0HiHqOz1p68xFqPB2UIClOPIBBPVPDXOCLHD9T-XHDPfHDLbPIDIrPPfLcnVvSnE+EvNlcvSraVavZpFnDAhcdnRvTnZvECF-dvSBHrLvIXfrM1PvS1a1JzUbYfZZJ1RmRMdwGAGbWFRgLAeoetdgBYFgAARXMVxGeGZGaAAA0sAxCX8Cg1dhpID9wV82FDt18GNeEDcE1LsXkZFO5YVjDcRT9bcXsQVcQzRNAoB3BWJzMZJ-slDnNnIU8A8cdhpg9H1f81DPwI9wZAC-Q-M8AgtgjfYgjHYjYXZTZqBhwAisp3BXAFlzJSok4iDSp-B+ByAIAwASxLJzgpwZ96dqCiMTlu8KNBt+8WCgEdD5AOBuA+ABAd9psSEFAlA8AGkZg8ALhGBLAfBEgfBeZJAecVC4I-DCBmEXIZxqAnQnAIikiUiwBtZ4do9Fxow6hjBagwBjANjyVVBpgVZmA2AzAIAehmBwgnAYxVAUAQBOBBAzIwAEAaxjAgA'
                )
              }
            >
              <text size="xsmall" weight="bold" color="blue">
                View example
              </text>
            </hstack>
            <hstack
              cornerRadius="small"
              backgroundColor="#fffee0"
              borderColor="black"
              padding="xsmall"
              onPress={() =>
                context.ui.navigateTo('https://developers.reddit.com/docs/blocks/stacks')
              }
            >
              <text weight="bold" size="xsmall" color="blue">
                Reference docs
              </text>
            </hstack>
          </hstack>
          <hstack gap="small" width={'100%'}>
            <text color="black" size="medium" wrap>
              3. When you're happy with your post, share it
            </text>
            <hstack alignment="middle">
              <icon size="xsmall" name="mod"></icon>
            </hstack>
          </hstack>
        </vstack>
      );
      return text;
    }
    text = (
      <vstack
        maxWidth={'50%'}
        gap="small"
        padding="small"
        border="thick"
        borderColor="#F4BB44"
        backgroundColor="#FFF59d"
        cornerRadius="small"
      >
        <text size="medium" color="black" wrap>
          1. Add an image.png to the "assets" folder
        </text>
        <text size="medium" color="black" wrap>
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
        <text size="medium" color="black" wrap>
          3. Replace "doot.png" with your image file name
        </text>
        <text size="medium" color="black" wrap>
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
