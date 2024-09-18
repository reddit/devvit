import { Devvit } from '@devvit/public-api';
import type { z } from 'zod';

import type { Schema } from '../../api/Schema.js';
import { formatUrl, randomId } from '../../util.js';
import { Page } from '../Page.js';
import type { CommonPinProps } from './common.js';

type WikiPin = z.infer<(typeof Schema)['wikiPin']>;

export const WikiPin = ({
  pin,
  context,
  updatePinPostPin,
  isOwner,
  navigate,
  pinPost: {
    primaryColor: { light },
  },
}: CommonPinProps & { pin: WikiPin }): JSX.Element => {
  const editWikiForm = context.useForm(
    {
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
      ],
      title: 'Edit Events Page',
      acceptLabel: 'Save',
    },
    async (data) => {
      await updatePinPostPin(pin.id, data);
      context.ui.showToast(`Your page has been updated!`);
    }
  );

  const wikiItemForm = context.useForm(
    {
      fields: [
        { name: 'title', label: `Title`, type: 'string' },
        { name: 'description', label: `Description`, type: 'string' },
        { name: 'url', label: `Url`, type: 'string' },
        { name: 'pinIcon', label: `Icon`, type: 'string' },
      ],
      title: 'Add Item',
      acceptLabel: 'Add',
    },
    async (data) => {
      // TODO: This should really be on the Schema with `.max(10)`
      if (pin.items.length > 9) {
        context.ui.showToast(`Sorry, you can only have 10 items at one time.`);
        return;
      }

      await updatePinPostPin(pin.id, {
        type: 'wiki',
        items: [
          ...pin.items,
          {
            id: randomId(),
            description: data.description || '',
            title: data.title || '',
            url: data.url || null,
          },
        ],
      });

      context.ui.showToast(`Item added!`);
    }
  );

  const editWikiItemForm = context.useForm(
    (dataArgs) => {
      const data = dataArgs as WikiPin['items'][number];

      return {
        fields: [
          {
            name: 'title',
            label: `Title`,
            type: 'string',
            defaultValue: data.title,
          },
          // {
          //   name: "description",
          //   label: `Description`,
          //   type: "string",
          //   defaultValue: data.description,
          // },
          {
            name: 'url',
            label: `Url`,
            type: 'string',
            defaultValue: data.url || '',
          },
          {
            name: 'id',
            label: `ID`,
            type: 'string',
            defaultValue: `${data.id}`,
            disabled: true,
          },
        ],
        title: 'Edit Item',
        acceptLabel: 'Save',
      } as const;
    },
    async (data) => {
      await updatePinPostPin(pin.id, {
        type: 'wiki',
        items: pin.items.map((x) => {
          if (x.id === data.id) {
            return {
              ...x,
              ...data,
              url: data.url ? formatUrl(data.url) : x.url,
            };
          }

          return x;
        }),
      });

      context.ui.showToast(`Your item has been updated!`);
    }
  );

  const removeItem = async (itemId: string): Promise<void> => {
    await updatePinPostPin(pin.id, {
      type: 'wiki',
      items: pin.items.filter((item) => item.id !== itemId),
    });

    context.ui.showToast('Item successfully removed!');
  };

  const addWikiItem: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(wikiItemForm);
  };

  const editPage: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(editWikiForm);
  };

  const firstRow = pin.items.slice(4, 6);
  const secondRow = pin.items.slice(2, 4);
  const thirdRow = pin.items.slice(0, 2);
  return (
    <Page>
      {isOwner && (
        <Page.Nav
          buttonStart={{
            buttonStartProps: { onPress: editPage, icon: 'settings' },
            buttonStartText: 'Settings',
          }}
          buttonMiddle={{
            buttonMiddleProps: { onPress: addWikiItem, icon: 'add' },
            buttonMiddleText: `Add Item`,
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
        <Page.ContentSubHeader>{pin.subheader}</Page.ContentSubHeader>
        <spacer size={'medium'} />
        <vstack gap="small" alignment="center">
          <hstack grow gap="small">
            {firstRow.map((firstRow, i) => (
              <hstack>
                <spacer size="small" />
                {firstRow.url ? (
                  <button
                    appearance="media"
                    onPress={() => {
                      if (firstRow.url) {
                        context.ui.navigateTo(firstRow.url);
                      }
                    }}
                  >
                    {' '}
                    {firstRow.title}
                  </button>
                ) : null}
                <spacer size="small" />
                <vstack></vstack>
                <spacer size="small" />
                {isOwner && (
                  <hstack>
                    <button
                      icon="edit"
                      appearance="success"
                      size="small"
                      onPress={() => context.ui.showForm(editWikiItemForm, firstRow)}
                    />
                    <spacer size="small" />
                    <button
                      icon="delete"
                      appearance="success"
                      size="small"
                      onPress={() => removeItem(firstRow.id)}
                    />
                  </hstack>
                )}
              </hstack>
            ))}
          </hstack>
          <hstack grow gap="small">
            {secondRow.map((secondRow, i) => (
              <hstack>
                <spacer size="small" />
                {secondRow.url ? (
                  <button
                    appearance="media"
                    onPress={() => {
                      if (secondRow.url) {
                        context.ui.navigateTo(secondRow.url);
                      }
                    }}
                  >
                    {secondRow.title}
                  </button>
                ) : null}
                <spacer size="small" />
                <vstack></vstack>
                <spacer size="small" />
                {isOwner && (
                  <hstack>
                    <button
                      icon="edit"
                      appearance="success"
                      size="small"
                      onPress={() => context.ui.showForm(editWikiItemForm, secondRow)}
                    />
                    <spacer size="small" />
                    <button
                      icon="delete"
                      appearance="success"
                      size="small"
                      onPress={() => removeItem(secondRow.id)}
                    />
                  </hstack>
                )}
              </hstack>
            ))}
          </hstack>
          <hstack grow gap="small">
            {thirdRow.map((thirdRow, i) => (
              <hstack>
                <spacer size="small" />
                {thirdRow.url ? (
                  <button
                    appearance="media"
                    onPress={() => {
                      if (thirdRow.url) {
                        context.ui.navigateTo(thirdRow.url);
                      }
                    }}
                  >
                    {thirdRow.title}
                  </button>
                ) : null}
                <spacer size="small" />
                <vstack></vstack>
                <spacer size="small" />
                {isOwner && (
                  <hstack>
                    <button
                      icon="edit"
                      appearance="success"
                      size="small"
                      onPress={() => context.ui.showForm(editWikiItemForm, thirdRow)}
                    />
                    <spacer size="small" />
                    <button
                      icon="delete"
                      appearance="success"
                      size="small"
                      onPress={() => removeItem(thirdRow.id)}
                    />
                  </hstack>
                )}
              </hstack>
            ))}
          </hstack>
        </vstack>
      </Page.Content>
    </Page>
  );
};
