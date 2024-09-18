import { Devvit } from '@devvit/public-api';
import type { z } from 'zod';

import type { Schema } from '../../api/Schema.js';
import { Page } from '../Page.js';
import type { CommonPinProps } from './common.js';

type FlairPin = z.infer<(typeof Schema)['flairPin']>;

export const FlairPin = ({
  pin,
  context,
  updatePinPostPin,
  isOwner,
  navigate,
  currentUserUsername,
  pinPost: {
    primaryColor: { light },
  },
}: CommonPinProps & { pin: FlairPin }): JSX.Element => {
  const editFlairPage = context.useForm(
    () => {
      // const body1 = pin.body?.[0]?.children?.[0]?.text ?? '';
      // const body2 = pin.body?.[1]?.children?.[0]?.text ?? '';
      // const body3 = pin.body?.[2]?.children?.[0]?.text ?? '';

      return {
        fields: [
          {
            name: 'pinTitle',
            label: `Homepage Button Text`,
            type: 'string',
            defaultValue: pin.pinTitle,
          },
          {
            name: 'header',
            label: `H1`,
            type: 'string',
            defaultValue: pin.header,
          },
          {
            name: 'subheader',
            label: `H2`,
            type: 'string',
            defaultValue: pin.subheader,
          },
          {
            name: 'includeLink',
            label: `Include link?`,
            type: 'boolean',
            defaultValue: pin.includeLink,
          },
          {
            name: 'url',
            label: `Flair URL`,
            type: 'string',
            defaultValue: pin.url ?? undefined,
          },
          // {
          //   name: "body1",
          //   label: `Line 1`,
          //   type: "string",
          //   defaultValue: body1,
          // },
          // {
          //   name: "body2",
          //   label: `Line 2`,
          //   type: "string",
          //   defaultValue: body2,
          // },
          // {
          //   name: "body3",
          //   label: `Line 3`,
          //   type: "string",
          //   defaultValue: body3,
          // },
        ],
        title: 'Edit Flair Page',
        acceptLabel: 'Save',
      } as const;
    },
    async (data) => {
      // const body: FlairPin['body'] = [];
      // if (data.body1) {
      //   body.push({
      //     type: "paragraph",
      //     children: [
      //       {
      //         type: "text",
      //         text: data.body1,
      //       },
      //     ],
      //   });
      // }
      // if (data.body2) {
      //   body.push({
      //     type: "paragraph",
      //     children: [
      //       {
      //         type: "text",
      //         text: data.body2,
      //       },
      //     ],
      //   });
      // }
      // if (data.body3) {
      //   body.push({
      //     type: "paragraph",
      //     children: [
      //       {
      //         type: "text",
      //         text: data.body3,
      //       },
      //     ],
      //   });
      // }

      await updatePinPostPin(pin.id, data);

      context.ui.showToast(`Your page has been updated! Refresh.`);
    }
  );

  const setUserFlair = context.useForm(
    () => {
      return {
        fields: [
          {
            name: 'flair',
            label: `Input Flair`,
            type: 'string',
          },
        ],
        title: 'Add Your Flair',
        acceptLabel: 'Save',
      } as const;
    },
    async (data) => {
      const { reddit } = context;
      const currentSubreddit = await reddit.getCurrentSubreddit();
      const subName = currentSubreddit.name;
      const flairOptions = {
        subredditName: subName,
        text: data.flair,
        username: currentUserUsername,
      };
      await reddit.setUserFlair(flairOptions);
      context.ui.showToast(`Your flair is being processed.`);
    }
  );

  const editPage: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(editFlairPage);
  };

  return (
    <Page>
      {isOwner && (
        <Page.Nav
          buttonStart={{
            buttonStartProps: { onPress: editPage, icon: 'settings' },
            buttonStartText: 'Settings',
          }}
          buttonEnd={{
            buttonEndProps: { onPress: editPage, icon: 'edit' },
            buttonEndText: 'Edit',
          }}
          bottomBorderColor={{
            light: light,
            dark: 'black',
          }}
        />
      )}
      <Page.Content navigate={navigate}>
        <Page.ContentHeader>{pin.header}</Page.ContentHeader>
        <spacer size="small" />
        <Page.ContentSubHeader>{pin.subheader}</Page.ContentSubHeader>
        <spacer size={'medium'} />
        <hstack grow alignment="center">
          <vstack gap="small" alignment="center">
            {pin.includeLink && (
              <button
                icon="browse"
                appearance="secondary"
                onPress={() => {
                  if (pin.url) {
                    context.ui.navigateTo(pin.url);
                  }
                }}
              >
                Find Flair Code
              </button>
            )}
            <button
              icon="effect"
              appearance="secondary"
              onPress={() => context.ui.showForm(setUserFlair)}
            >
              Set My Flair
            </button>
          </vstack>
        </hstack>
      </Page.Content>
    </Page>
  );
};
