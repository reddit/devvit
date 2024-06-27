import type { FormField } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { dset } from 'dset';
import type { z } from 'zod';
import type { Schema } from '../api/Schema.js';
import { Page } from '../components/Page.js';
import { PinButton } from '../components/Pin/Pin.js';
import type { PageProps } from '../types/page.js';
import { chunk, deepClone } from '../util.js';

export default Devvit;
export const HomePage = async ({
  navigate,
  context,
  pinPost,
  isOwner,
  currentUserUsername,
  pinPostMethods: { updatePinPost, updatePinPostPin },
}: PageProps): Promise<JSX.Element> => {
  const { useState } = context;
  // Only living here instead of at PinButton due to bug:
  // https://reddit.atlassian.net/browse/DX-4508
  const [formPin, setFormPin] = useState<z.infer<(typeof Schema)['formPin']> | null>(null);
  const enabledPins = pinPost.pins.filter((x) => x.enabled);

  const editHomePage = context.useForm(
    {
      fields: [
        {
          name: 'header',
          label: `H1`,
          type: 'string',
          defaultValue: `${pinPost.header}`,
        },
      ],
      title: 'Edit Page',
      acceptLabel: 'Save',
    },
    async (data) => {
      await updatePinPost({
        header: data.header,
      });
      context.ui.showToast(`Your page has been updated!`);
    }
  );

  const editFormMode = context.useForm(
    () => {
      if (!formPin) {
        throw new Error(`No form pin found!`);
      }
      /**
       * IMPORTANT!!
       *
       * Always make the name of the form items the same as the keys in
       * the form pin object. Arrays are dot notated with the number being
       * their index in the array.
       */
      return {
        title: `Editing: ${formPin.formTitle || 'Form'}`,
        fields: [
          {
            label: 'Form Setup',
            type: 'group',
            fields: [
              {
                type: 'string',
                label: 'Form Title',
                defaultValue: formPin.formTitle,
                name: 'formTitle',
              },
            ],
          },
          ...formPin.items.map<FormField>((item, index) => {
            return {
              label: `Question ${index + 1}`,
              type: 'group',
              fields: [
                {
                  type: 'string',
                  label: 'Label',
                  name: `items.${index}.label`,
                  defaultValue: item.label,
                },
                {
                  type: 'select',
                  label: 'Type',
                  name: `items.${index}.type`,
                  defaultValue: [item.type],
                  options: [
                    { label: 'String', value: 'string' },
                    { label: 'Paragraph', value: 'paragraph' },
                  ],
                },
                {
                  type: 'boolean',
                  label: 'Required',
                  name: `items.${index}.required`,
                  defaultValue: item.required,
                },
              ],
            };
          }),
        ],
      } as const;
    },
    async (data) => {
      if (!formPin) {
        throw new Error(`No form pin found!`);
      }

      const newFormPin = deepClone(formPin);
      Object.entries(data).forEach(([key, value]) => {
        const path = key.split('.');
        // Select returns an array not an item, even with multiselect is off
        dset(newFormPin, path, key.endsWith('.type') ? (value as string[])[0] : value);
      });

      // This checks against the schema in case we incorrectly set an object key
      // we do not expect
      await updatePinPostPin(newFormPin.id, newFormPin);

      context.ui.showToast(`Form fields updated successfully!`);
    }
  );

  const submitFormMode = context.useForm(
    () => {
      if (!formPin) {
        throw new Error(`No form pin found!`);
        //TODO this is erroring for non owners
      }

      return {
        title: formPin.formTitle,
        description: formPin.formDescription,
        acceptLabel: formPin.formAcceptLabel || 'Accept',
        cancelLabel: formPin.formCancelLabel || 'Cancel',
        fields: formPin.items,
      };
    },
    async (data) => {
      if (!formPin) {
        throw new Error(`No form pin found!`);
      }

      if (!currentUserUsername) {
        context.ui.showToast('You must be logged in to take this action');
        return;
      }

      const { reddit } = context;
      const currentSubreddit = await reddit.getCurrentSubreddit();
      const subName = currentSubreddit.name;

      let messageBody = `New ${formPin.formName}: u/${currentUserUsername}`;
      Object.entries(data).forEach(([key, value]) => {
        const relatedPinItem = formPin.items.find((item) => item.name === key);
        if (!relatedPinItem) {
          throw new Error(`Cannot find related form item from key: ${key}`);
        }

        messageBody += `
      
**${relatedPinItem.label}**
${value}`;
      });

      const msgOpt = {
        subject: `New ${formPin.formName || 'Form'} Submission: ${currentUserUsername}`,
        to: `r/${subName}`,
        text: messageBody,
      };

      //would love to move these out of mod convos
      await reddit.sendPrivateMessage(msgOpt);
      context.ui.showToast(`Message sent!`);
    }
  );

  const ownerChoiceForm = context.useForm(
    {
      title: 'Edit or preview',
      fields: [
        {
          name: 'editMode',
          label: `Edit the form?`,
          type: 'boolean',
          defaultValue: false,
        },
      ],
      acceptLabel: 'Next',
    },
    (data) => {
      if (data.editMode) {
        context.ui.showForm(editFormMode);
      } else {
        context.ui.showForm(submitFormMode);
      }
    }
  );

  const userForm = context.useForm(
    () => {
      return {
        title: 'Note: message will be attributed to your username',
        fields: [],
        acceptLabel: 'Next',
      };
    },
    (data) => {
      context.ui.showForm(submitFormMode);
    }
  );

  const editPage: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(editHomePage);
  };

  const settingsPage: Devvit.Blocks.OnPressEventHandler = async () => {
    navigate('admin');
  };

  return (
    <Page>
      <Page.Content navigate={navigate} showHomeButton={false}>
        <vstack alignment="center" lightBackgroundColor="#FFFFFF" darkBackgroundColor="#1A1A1B">
          <zstack width={100} alignment="middle">
            <hstack width={100} alignment="center middle">
              <text size="xlarge" color="black white" weight="bold">
                {pinPost.header}
              </text>
            </hstack>
            {isOwner && (
              <hstack gap="small" alignment="start">
                <hstack>
                  <button
                    onPress={settingsPage}
                    icon="settings"
                    size="small"
                    textColor="green"
                    appearance="primary"
                  ></button>
                </hstack>
                <hstack>
                  <button
                    onPress={editPage}
                    icon="edit"
                    size="small"
                    textColor="green"
                    appearance="primary"
                  ></button>
                </hstack>
              </hstack>
            )}
          </zstack>
          <hstack alignment="middle center">
            <image url={pinPost.featuredImage} imageWidth={80} imageHeight={80} resizeMode="fit" />
          </hstack>
          <hstack alignment="center" gap="small" maxWidth={70} width={100}>
            {chunk(enabledPins, enabledPins.length / 2)
              .reverse()
              .map((pins) => {
                return (
                  <vstack grow gap="small">
                    {pins.map((pin) => {
                      return (
                        <PinButton
                          pin={pin}
                          navigate={navigate}
                          context={context}
                          currentUserUsername={currentUserUsername}
                          onClickForm={(pin) => {
                            console.log(pin);
                            setFormPin(pin);
                            if (isOwner) {
                              context.ui.showForm(ownerChoiceForm);
                            } else {
                              context.ui.showForm(userForm);
                            }
                          }}
                        />
                      );
                    })}
                  </vstack>
                );
              })}
          </hstack>
        </vstack>
      </Page.Content>
    </Page>
  );
};
